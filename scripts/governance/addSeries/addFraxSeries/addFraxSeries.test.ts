import { ethers } from 'hardhat'

import { BigNumber } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import {
  readAddressMappingIfExists,
  bytesToBytes32,
  impersonate,
  getOwnerOrImpersonate,
  getOriginalChainId,
} from '../../../../shared/helpers'
import { ERC20Mock, Cauldron, Ladle, FYToken, CompositeMultiOracle } from '../../../../typechain'
import { UNI, WAD } from '../../../../shared/constants'
const { developer, seriesIlks, assets, whales } = require(process.env.CONF as string)

/**
 * @dev This script tests all the collateral for borrowing FRAX
 */
;(async () => {
  const chainId = await getOriginalChainId()
  let ownerAcc = await getOwnerOrImpersonate(developer, WAD)
  let whaleAcc: SignerWithAddress

  const protocol = readAddressMappingIfExists('protocol.json')

  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron
  const ladle = (await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as unknown as Ladle
  const oracle = (await ethers.getContractAt(
    'CompositeMultiOracle',
    protocol.get('compositeOracle') as string,
    ownerAcc
  )) as unknown as CompositeMultiOracle

  for (let [seriesId, ilks] of seriesIlks) {
    for (const ilk of ilks) {
      var collateral = (await ethers.getContractAt(
        'contracts/::mocks/ERC20Mock.sol:ERC20Mock',
        assets.get(ilk) as string,
        ownerAcc
      )) as unknown as ERC20Mock

      whaleAcc = await impersonate(whales.get(ilk) as string, WAD)
      if (chainId != 1 && ilk != UNI) await collateral.connect(ownerAcc).mint(whaleAcc.address, WAD.mul(1000))
      console.log(`series: ${seriesId}`)
      const series = await cauldron.series(seriesId)
      const fyToken = (await ethers.getContractAt('FYToken', series.fyToken, ownerAcc)) as unknown as FYToken

      const dust = (await cauldron.debt(series.baseId, ilk)).min
      const ratio = (await cauldron.spotOracles(series.baseId, ilk)).ratio
      const borrowed = BigNumber.from(10)
        .pow(await fyToken.decimals())
        .mul(dust)
      const posted = (await oracle.peek(bytesToBytes32(series.baseId), bytesToBytes32(ilk), borrowed))[0]
        .mul(ratio)
        .div(1000000)
        .mul(101)
        .div(100)
      const collateralBalanceBefore = await collateral.balanceOf(whaleAcc.address)

      // Build vault
      await ladle.connect(whaleAcc).build(seriesId, ilk, 0)
      const logs = await cauldron.queryFilter(cauldron.filters.VaultBuilt(null, null, null, null))
      const vaultId = logs[logs.length - 1].args.vaultId
      console.log(`vault: ${vaultId}`)

      var name = await fyToken.callStatic.name()
      // Post collateral and borrow
      const collateralJoinAddress = await ladle.joins(ilk)
      console.log(`posting ${posted} ilk out of ${await collateral.balanceOf(whaleAcc.address)}`)
      await collateral.connect(whaleAcc).transfer(collateralJoinAddress, posted)
      console.log(`borrowing ${borrowed} ${name}`)
      await ladle.connect(whaleAcc).pour(vaultId, whaleAcc.address, posted, borrowed)
      console.log(`posted and borrowed`)

      if ((await cauldron.balances(vaultId)).art.toString() !== borrowed.toString()) throw 'art mismatch'
      if ((await cauldron.balances(vaultId)).ink.toString() !== posted.toString()) throw 'ink mismatch'

      // Repay fyFRAX and withdraw collateral
      await fyToken.connect(whaleAcc).transfer(fyToken.address, borrowed)
      console.log(`repaying ${borrowed} ${name} and withdrawing ${posted} ilk`)
      await ladle.connect(whaleAcc).pour(vaultId, whaleAcc.address, posted.mul(-1), borrowed.mul(-1))
      console.log(`repaid and withdrawn`)
      if ((await collateral.balanceOf(whaleAcc.address)).toString() !== collateralBalanceBefore.toString())
        throw 'balance mismatch'
    }
  }
})()

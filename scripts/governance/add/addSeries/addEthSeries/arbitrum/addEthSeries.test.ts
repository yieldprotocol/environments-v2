import { ethers } from 'hardhat'

import { BigNumber } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import {
  readAddressMappingIfExists,
  bytesToBytes32,
  impersonate,
  getOriginalChainId,
  getOwnerOrImpersonate,
} from '../../../../../../shared/helpers'
import {
  ERC20Mock,
  Cauldron,
  Ladle,
  FYToken,
  CompositeMultiOracle,
  AccumulatorMultiOracle,
  ChainlinkUSDMultiOracle,
} from '../../../../../../typechain'
import { ETH, WAD } from '../../../../../../shared/constants'
import { whales } from '../../../../base.arb_mainnet.config'
const { developer, seriesIlks, assets } = require(process.env.CONF as string)

/**
 * @dev This script tests ETH as a collateral
 */
;(async () => {
  const chainId = await getOriginalChainId()

  let ownerAcc = await getOwnerOrImpersonate(developer)
  let whaleAcc: SignerWithAddress

  const protocol = readAddressMappingIfExists('protocol.json')

  const eth = (await ethers.getContractAt(
    'contracts/::mocks/ERC20Mock.sol:ERC20Mock',
    assets.get(ETH) as string,
    ownerAcc
  )) as unknown as ERC20Mock

  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron
  const ladle = (await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as unknown as Ladle
  const oracle = (await ethers.getContractAt(
    'ChainlinkUSDMultiOracle',
    protocol.get('chainlinkUSDOracle') as string,
    ownerAcc
  )) as unknown as ChainlinkUSDMultiOracle

  // ETH whale
  whaleAcc = await impersonate(whales.get(ETH) as string, WAD)

  for (let [seriesId, ilks] of seriesIlks) {
    console.log(`series: ${seriesId}`)
    for (const ilk of ilks) {
      console.log(`ilk: ${ilk}`)
      var collateral = (await ethers.getContractAt(
        'contracts/::mocks/ERC20Mock.sol:ERC20Mock',
        assets.get(ilk) as string,
        ownerAcc
      )) as unknown as ERC20Mock
      const series = await cauldron.series(seriesId)
      const fyToken = (await ethers.getContractAt('FYToken', series.fyToken, ownerAcc)) as unknown as FYToken
      const dust = (await cauldron.debt(series.baseId, ilk)).min
      const ratio = (await cauldron.spotOracles(series.baseId, ilk)).ratio
      var borrowed = BigNumber.from(10).pow(await fyToken.decimals())

      const posted = (await oracle.peek(bytesToBytes32(series.baseId), bytesToBytes32(ilk), borrowed))[0]
        .mul(ratio)
        .div(1000000)
        .mul(101)
        .div(100) // borrowed * spot * ratio * 1.01 (for margin)

      const ethBalanceBefore = await collateral.balanceOf(whaleAcc.address)

      // Build vault
      await ladle.connect(whaleAcc).build(seriesId, ilk, 0)

      // console.log(tt)
      const logs = await cauldron.queryFilter(cauldron.filters.VaultBuilt(null, whaleAcc.address, null, null))

      const vaultId = logs[logs.length - 1].args.vaultId
      console.log(`vault: ${vaultId}`)

      var name = await fyToken.callStatic.name()
      // Post eth and borrow
      const ethJoinAddress = await ladle.joins(ilk)
      console.log(`posting ${posted} ilk out of ${await collateral.balanceOf(whaleAcc.address)}`)
      await collateral.connect(whaleAcc).transfer(ethJoinAddress, posted)
      console.log(`borrowing ${borrowed} ${name}`)
      await ladle.connect(whaleAcc).pour(vaultId, whaleAcc.address, posted, borrowed)
      console.log(`posted and borrowed`)
      if ((await cauldron.balances(vaultId)).art.toString() !== borrowed.toString()) throw 'art mismatch'
      if ((await cauldron.balances(vaultId)).ink.toString() !== posted.toString()) throw 'ink mismatch'

      // Repay fyEth and withdraw
      await fyToken.connect(whaleAcc).transfer(fyToken.address, borrowed)
      console.log(`repaying ${borrowed} ${name} and withdrawing ${posted} ilk`)
      await ladle.connect(whaleAcc).pour(vaultId, whaleAcc.address, posted.mul(-1), borrowed.mul(-1))
      console.log(`repaid and withdrawn`)
      if ((await collateral.balanceOf(whaleAcc.address)).toString() !== ethBalanceBefore.toString())
        throw 'balance mismatch'
    }
  }
})()

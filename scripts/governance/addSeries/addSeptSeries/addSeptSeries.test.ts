import { ethers } from 'hardhat'

import { BigNumber } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import {
  readAddressMappingIfExists,
  bytesToBytes32,
  impersonate,
  getOriginalChainId,
  getOwnerOrImpersonate,
} from '../../../../shared/helpers'
import { ERC20Mock, Cauldron, Ladle, FYToken, CompositeMultiOracle, WstETHMock } from '../../../../typechain'
import { ENS, STETH, WAD } from '../../../../shared/constants'
const { developer, whale, seriesIlks, assets } = require(process.env.CONF as string)

/**
 * @dev This script tests ENS as a collateral
 */
;(async () => {
  const chainId = await getOriginalChainId()

  let ownerAcc = await getOwnerOrImpersonate(developer)
  let whaleAcc: SignerWithAddress

  const protocol = readAddressMappingIfExists('protocol.json')

  const ens = (await ethers.getContractAt(
    'contracts/::mocks/ERC20Mock.sol:ERC20Mock',
    assets.get(ENS) as string,
    ownerAcc
  )) as unknown as ERC20Mock

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

  whaleAcc = await impersonate('0x5a52e96bacdabb82fd05763e25335261b270efcb', WAD)

  for (let [seriesId] of seriesIlks) {
    console.log(`series: ${seriesId}`)
    const series = await cauldron.series(seriesId)
    const fyToken = (await ethers.getContractAt('FYToken', series.fyToken, ownerAcc)) as unknown as FYToken

    const dust = (await cauldron.debt(series.baseId, ENS)).min
    const ratio = (await cauldron.spotOracles(series.baseId, ENS)).ratio
    const borrowed = BigNumber.from(10)
      .pow(await fyToken.decimals())
      .mul(dust)
    const posted = (await oracle.peek(bytesToBytes32(series.baseId), bytesToBytes32(ENS), borrowed))[0]
      .mul(ratio)
      .div(1000000)
      .mul(101)
      .div(100) // borrowed * spot * ratio * 1.01 (for margin)
    const ensBalanceBefore = await ens.balanceOf(whaleAcc.address)

    // Build vault
    await ladle.connect(whaleAcc).build(seriesId, ENS, 0)
    const logs = await cauldron.queryFilter(cauldron.filters.VaultBuilt(null, null, null, null))
    const vaultId = logs[logs.length - 1].args.vaultId
    console.log(`vault: ${vaultId}`)

    var name = await fyToken.callStatic.name()
    // Post ens and borrow
    const ensJoinAddress = await ladle.joins(ENS)
    console.log(`posting ${posted} ENS out of ${await ens.balanceOf(whaleAcc.address)}`)
    await ens.connect(whaleAcc).transfer(ensJoinAddress, posted)
    console.log(`borrowing ${borrowed} ${name}`)
    await ladle.connect(whaleAcc).pour(vaultId, whaleAcc.address, posted, borrowed)
    console.log(`posted and borrowed`)

    if ((await cauldron.balances(vaultId)).art.toString() !== borrowed.toString()) throw 'art mismatch'
    if ((await cauldron.balances(vaultId)).ink.toString() !== posted.toString()) throw 'ink mismatch'

    // Repay fyEth and withdraw ens
    await fyToken.connect(whaleAcc).transfer(fyToken.address, borrowed)
    console.log(`repaying ${borrowed} ${name} and withdrawing ${posted} ENS`)
    await ladle.connect(whaleAcc).pour(vaultId, whaleAcc.address, posted.mul(-1), borrowed.mul(-1))
    console.log(`repaid and withdrawn`)
    if ((await ens.balanceOf(whaleAcc.address)).toString() !== ensBalanceBefore.toString()) throw 'balance mismatch'
  }
})()

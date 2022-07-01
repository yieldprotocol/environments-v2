import { ethers } from 'hardhat'

import { BigNumber } from 'ethers'
import {
  getOriginalChainId,
  readAddressMappingIfExists,
  bytesToBytes32,
  impersonate,
  getOwnerOrImpersonate,
} from '../../../../../shared/helpers'
import { ERC20Mock, Cauldron, Ladle, FYToken, ChainlinkMultiOracle } from '../../../../../typechain'
const { developer, whale, assetToAdd, seriesIlks,whales,assets } = require(process.env.CONF as string)
import { GNO, WAD } from '../../../../../shared/constants'

/**
 * @dev This script tests an asset as a collateral
 */
;(async () => {
  const chainId = await getOriginalChainId()
  if (chainId !== 1 && chainId !== 42) throw 'Only Kovan and Mainnet supported'

  let ownerAcc = await getOwnerOrImpersonate(developer)

  const protocol = readAddressMappingIfExists('protocol.json')

  
  const asset = (await ethers.getContractAt('contracts/::mocks/ERC20Mock.sol:ERC20Mock',assets.get(GNO) as string, ownerAcc)) as unknown as ERC20Mock
  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron
  const ladle = (await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as unknown as Ladle
  const oracle = (await ethers.getContractAt(
    'ChainlinkMultiOracle',
    protocol.get('chainlinkOracle') as string,
    ownerAcc
  )) as unknown as ChainlinkMultiOracle

  // If using a mock, make a whale yourself :)
  let whaleAcc = await impersonate(whales.get(GNO) as string, WAD)

  const assetBalanceBefore = await asset.balanceOf(whaleAcc.address)
  console.log(`${assetBalanceBefore} ${await asset.symbol()} available`)

  for (let [seriesId] of seriesIlks) {
    console.log(`series: ${seriesId}`)
    const series = await cauldron.series(seriesId)
    const fyToken = (await ethers.getContractAt('FYToken', series.fyToken, ownerAcc)) as unknown as FYToken

    const dust = (await cauldron.debt(series.baseId, GNO)).min
    const ratio = (await cauldron.spotOracles(series.baseId, GNO)).ratio
    const borrowed = BigNumber.from(10)
      .pow(await fyToken.decimals())
      .mul(dust)
    const posted = (await oracle.peek(bytesToBytes32(series.baseId), bytesToBytes32(GNO), borrowed))[0]
      .mul(ratio)
      .div(1000000)
      .mul(101)
      .div(100) // borrowed * spot * ratio * 1.01 (for margin)

    // Build vault
    await ladle.connect(whaleAcc).build(seriesId, GNO, 0)
    const logs = await cauldron.queryFilter(cauldron.filters.VaultBuilt(null, null, null, null))
    const vaultId = logs[logs.length - 1].args.vaultId
    console.log(`vault: ${vaultId}`)

    // Post GNO and borrow fyDAI
    const assetJoinAddress = await ladle.joins(GNO)
    await asset.connect(whaleAcc).transfer(assetJoinAddress, posted)
    await ladle.connect(whaleAcc).pour(vaultId, whaleAcc.address, posted, borrowed)
    console.log(`posted and borrowed`)

    if ((await cauldron.balances(vaultId)).art.toString() !== borrowed.toString()) throw 'art mismatch'
    if ((await cauldron.balances(vaultId)).ink.toString() !== posted.toString()) throw 'ink mismatch'

    // Repay fyDai and withdraw asset
    await fyToken.connect(whaleAcc).transfer(fyToken.address, borrowed)
    await ladle.connect(whaleAcc).pour(vaultId, whaleAcc.address, posted.mul(-1), borrowed.mul(-1))
    console.log(`repaid and withdrawn`)
    if ((await asset.balanceOf(whaleAcc.address)).toString() !== assetBalanceBefore.toString()) throw 'balance mismatch'
  }
})()

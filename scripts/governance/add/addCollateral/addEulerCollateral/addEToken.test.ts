import { BigNumber } from 'ethers'
import { ethers } from 'hardhat'
import {
  EDAI,
  EULER,
  EUSDC,
  EWETH,
  FYDAI2209,
  FYDAI2212,
  FYETH2209,
  FYETH2212,
  FYUSDC2209,
  FYUSDC2212,
  WAD,
} from '../../../../../shared/constants'
import { bytesToBytes32, impersonate, readAddressMappingIfExists } from '../../../../../shared/helpers'
import {
  Cauldron__factory,
  ERC20__factory,
  FYToken__factory,
  IOracle__factory,
  Ladle__factory,
} from '../../../../../typechain'
import { assets, whales } from '../../../base.mainnet.config'

const protocol: Map<string, string> = readAddressMappingIfExists('protocol.json')

/**
 * @dev This script tests FCASH as a collateral
 */
;(async () => {
  const seriesIlks: Array<[string, string]> = [
    [FYDAI2209, EDAI],
    [FYUSDC2209, EUSDC],
    [FYETH2209, EWETH],
    [FYDAI2212, EDAI],
    [FYUSDC2212, EUSDC],
    [FYETH2212, EWETH],
  ]

  for (let [seriesId, ilkId] of seriesIlks) {
    const whale = await impersonate(whales.get(ilkId)!, WAD)
    const ilkERC20 = ERC20__factory.connect(assets.get(ilkId)!, whale)
    const ilkBalanceBefore = await ilkERC20.balanceOf(whale.address)
    const ilkERC20name = await ilkERC20.symbol()
    const ilkERC20Decimals = await ilkERC20.decimals()
    console.log(`${ilkERC20name} balance before: ${ethers.utils.formatUnits(ilkBalanceBefore, ilkERC20Decimals)}`)
    const cauldron = Cauldron__factory.connect(protocol.get('cauldron')!, whale)
    console.log(`series: ${seriesId}: ${Buffer.from(seriesId.substring(2), 'hex')}`)
    const series = await cauldron.series(seriesId)
    const fyToken = FYToken__factory.connect(series.fyToken, whale)

    const debt = await cauldron.debt(series.baseId, ilkId)
    console.log(`debt: ${await cauldron.debt(series.baseId, ilkId)}`)
    const ratio = (await cauldron.spotOracles(series.baseId, ilkId)).ratio
    console.log(`ratio: ${ratio}`)
    const borrowed = BigNumber.from(10).pow(debt.dec).mul(debt.min)
    console.log(`borrowed: ${borrowed} (${ethers.utils.formatUnits(borrowed, await fyToken.decimals())})`)
    const oracle = IOracle__factory.connect(protocol.get(EULER)!, whale)
    const posted = (await oracle.peek(bytesToBytes32(series.baseId), bytesToBytes32(ilkId), borrowed))[0]
      .mul(ratio)
      .div(1000000)
      .mul(101)
      .div(100) // borrowed * spot * ratio * 1.01 (for margin)
    console.log(`posted: ${posted} (${ethers.utils.formatUnits(posted, ilkERC20Decimals)})`)

    const ladle = Ladle__factory.connect(protocol.get('ladle')!, whale)

    // Build vault
    await ladle.build(seriesId, ilkId, 0)
    const logs = await cauldron.queryFilter(cauldron.filters.VaultBuilt(null, null, null, null))
    const vaultId = logs[logs.length - 1].args.vaultId
    console.log(`vault: ${vaultId}`)

    // Post EDAI and borrow fyDAI
    const joinAddress = await ladle.joins(ilkId)
    await ilkERC20.transfer(joinAddress, posted)
    console.log(`transfered ${posted} ${ilkERC20name} to join at: ${joinAddress}`)
    await ladle.pour(vaultId, whale.address, posted, borrowed)
    console.log('posted and borrowed')

    if ((await cauldron.balances(vaultId)).art.toString() !== borrowed.toString()) throw 'art mismatch'
    if ((await cauldron.balances(vaultId)).ink.toString() !== posted.toString()) throw 'ink mismatch'

    // Repay fyDai and withdraw fCash
    await fyToken.transfer(fyToken.address, borrowed)
    await ladle.pour(vaultId, whale.address, posted.mul(-1), borrowed.mul(-1))
    console.log('repaid and withdrawn')
    if ((await ilkERC20.balanceOf(whale.address)).toString() !== ilkBalanceBefore.toString()) {
      throw 'balance mismatch'
    }
  }
})()

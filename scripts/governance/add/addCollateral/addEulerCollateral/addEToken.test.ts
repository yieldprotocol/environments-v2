import { BigNumber } from 'ethers'
import { ethers } from 'hardhat'
import { EDAI, EULER, FYDAI2209, WAD } from '../../../../../shared/constants'
import { bytesToBytes32, impersonate, readAddressMappingIfExists } from '../../../../../shared/helpers'
import {
  Cauldron,
  Cauldron__factory,
  ERC20Mock__factory,
  FYToken__factory,
  IOracle__factory,
  Ladle__factory,
} from '../../../../../typechain'
import { IERC20__factory } from '../../../../../typechain/factories/@yield-protocol/utils-v2/contracts/token'

const protocol: Map<string, string> = readAddressMappingIfExists('protocol.json')
const eDaiAddress = '0xe025E3ca2bE02316033184551D4d3Aa22024D9DC'
const eDaiWhaleAddress = '0xb84cd93582cf94b0625c740f7ea441e33bc6fd6c'

/**
 * @dev This script tests FCASH as a collateral
 */
;(async () => {
  const user = await impersonate(eDaiWhaleAddress, WAD)
  const seriesIlks: Array<[string, string]> = [[FYDAI2209, EDAI]]
  const cauldron = Cauldron__factory.connect(protocol.get('cauldron')!, user)
  const ladle = Ladle__factory.connect(protocol.get('ladle')!, user)
  const oracle = IOracle__factory.connect(protocol.get(EULER)!, user)
  const eDAI = ERC20Mock__factory.connect(eDaiAddress, user)

  for (let [seriesId, ilkId] of seriesIlks) {
    const eDaiBalanceBefore = await eDAI.balanceOf(user.address)
    console.log(`eDai balance before: ${eDaiBalanceBefore}`)
    console.log(`series: ${seriesId}`)
    const series = await cauldron.series(seriesId)
    const fyToken = FYToken__factory.connect(series.fyToken, user)

    const dust = (await cauldron.debt(series.baseId, ilkId)).min
    console.log(`dust: ${dust}`)
    console.log(`debt: ${await cauldron.debt(series.baseId, ilkId)}`)
    const ratio = (await cauldron.spotOracles(series.baseId, ilkId)).ratio
    console.log(`ratio: ${ratio}`)
    const borrowed = BigNumber.from(10)
      .pow(await fyToken.decimals())
      .mul(dust)
    console.log(`borrowed: ${borrowed}`)

    const posted = (await oracle.peek(bytesToBytes32(series.baseId), bytesToBytes32(ilkId), borrowed))[0]
      .mul(ratio)
      .div(1000000)
      .mul(101)
      .div(100) // borrowed * spot * ratio * 1.01 (for margin)
    console.log(`posted: ${posted}`)

    // Build vault
    await ladle.build(seriesId, ilkId, 0)
    const logs = await cauldron.queryFilter(cauldron.filters.VaultBuilt(null, null, null, null))
    const vaultId = logs[logs.length - 1].args.vaultId
    console.log(`vault: ${vaultId}`)

    // Post EDAI and borrow fyDAI
    const joinAddress = await ladle.joins(ilkId)
    await eDAI.transfer(joinAddress, posted)
    console.log(`transfered ${posted} eDAI to join at: ${joinAddress}`)
    await ladle.pour(vaultId, user.address, posted, borrowed)
    console.log('posted and borrowed')

    if ((await cauldron.balances(vaultId)).art.toString() !== borrowed.toString()) throw 'art mismatch'
    if ((await cauldron.balances(vaultId)).ink.toString() !== posted.toString()) throw 'ink mismatch'

    // Repay fyDai and withdraw fCash
    await fyToken.transfer(fyToken.address, borrowed)
    await ladle.pour(vaultId, user.address, posted.mul(-1), borrowed.mul(-1))
    console.log('repaid and withdrawn')
    if ((await eDAI.balanceOf(user.address)).toString() !== eDaiBalanceBefore.toString()) {
      throw 'balance mismatch'
    }
  }
})()

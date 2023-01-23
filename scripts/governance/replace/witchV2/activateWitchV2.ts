import { getOwnerOrImpersonate, propose } from '../../../../shared/helpers'
import { orchestrateWitchV2Fragment } from '../../../fragments/core/orchestrateWitch'
import { protectFromLiquidationsFragment } from '../../../fragments/witch/protectFromLiquidations'
import { orchestrateAuctionAssetsFragment } from '../../../fragments/witch/orchestrateAuctionAssets'
import { setAuctionParametersFragment } from '../../../fragments/witch/setAuctionParameters'
import { AuctionLineAndLimit } from '../../confTypes'
import { TIMELOCK, CLOAK, CAULDRON, LADLE, WITCH_V1, WITCH } from '../../../../shared/constants'
import {
  Cauldron__factory,
  EmergencyBrake__factory,
  Ladle__factory,
  Timelock__factory,
  Witch__factory,
} from '../../../../typechain'

const { protocol, governance, developer, v2Limits, seriesIds } = require(process.env.CONF as string)

/**
 * @dev This script orchestrates the Witch V2, configures DAI liquidations on it, and protects the Witch v1
 */

;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer as string)

  const timelock = Timelock__factory.connect(governance.get(TIMELOCK)!, ownerAcc)
  const cloak = EmergencyBrake__factory.connect(governance.get(CLOAK)!, ownerAcc)
  const cauldron = Cauldron__factory.connect(protocol().getOrThrow(CAULDRON), ownerAcc)
  const ladle = Ladle__factory.connect(protocol().getOrThrow(LADLE), ownerAcc)
  const witchV2 = Witch__factory.connect(protocol().getOrThrow(WITCH), ownerAcc)

  const baseIds = [...new Set((v2Limits as AuctionLineAndLimit[]).map(({ baseId }) => baseId))] // Pass through a Set to remove duplicates
  const ilkIds = [...new Set((v2Limits as AuctionLineAndLimit[]).map(({ ilkId }) => ilkId))]

  // Build the proposal
  const proposal = [
    await orchestrateWitchV2Fragment(ownerAcc, timelock, cloak, cauldron, witchV2),
    await orchestrateAuctionAssetsFragment(ownerAcc, cloak, cauldron, ladle, witchV2, baseIds, ilkIds, seriesIds),
    await setAuctionParametersFragment(witchV2, v2Limits),
    await protectFromLiquidationsFragment(witchV2, protocol().getOrThrow(WITCH_V1)),
  ].flat(1)

  // Propose, Approve & execute
  await propose(timelock, proposal, developer)
})()

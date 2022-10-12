import { getOwnerOrImpersonate, proposeApproveExecute } from '../../../../shared/helpers'
import { orchestrateWitchV2Fragment } from '../../../fragments/core/orchestrateWitchV2Fragment'
import { updateWitchLimitsFragment } from '../../../fragments/liquidations/updateWitchLimitsFragment'
import { enableLiquidationsFragment } from '../../../fragments/liquidations/enableLiquidationsFragment'

import { TIMELOCK, CLOAK, MULTISIG, CAULDRON, LADLE, WITCH_V1, WITCH } from '../../../../shared/constants'
import {
  Cauldron__factory,
  EmergencyBrake__factory,
  Ladle__factory,
  Timelock__factory,
  Witch__factory,
  OldWitch__factory,
} from '../../../../typechain'

const { protocol, governance, developer, v1Limits, v2Limits, seriesIds } = require(process.env.CONF as string)

/**
 * @dev This script orchestrates the Witch V2 and moves DAI liquidations from v1 to v2
 */

;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer as string)

  const timelock = Timelock__factory.connect(governance.get(TIMELOCK)!, ownerAcc)
  const cloak = EmergencyBrake__factory.connect(governance.get(CLOAK)!, ownerAcc)
  const cauldron = Cauldron__factory.connect(protocol.get(CAULDRON)!, ownerAcc)
  const ladle = Ladle__factory.connect(protocol.get(LADLE)!, ownerAcc)
  const witchV1 = OldWitch__factory.connect(protocol.get(WITCH_V1)!, ownerAcc)
  const witchV2 = Witch__factory.connect(protocol.get(WITCH)!, ownerAcc)

  // Build the proposal
  const proposal = [
    await orchestrateWitchV2Fragment(ownerAcc, timelock, cloak, cauldron, witchV2),
    // Allow Witch V2 to liquidate DAI collateralized positions
    await enableLiquidationsFragment(ownerAcc, cloak, cauldron, ladle, witchV2, seriesIds, v2Limits),
    // Stop Witch V1 from liquidating DAI collateralized positions
    await updateWitchLimitsFragment(witchV1, v1Limits),
  ].flat(1)

  // Propose, Approve & execute
  await proposeApproveExecute(timelock, proposal, governance.get(MULTISIG)!, developer)
})()

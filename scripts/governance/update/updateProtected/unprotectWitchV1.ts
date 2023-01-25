import { getOwnerOrImpersonate, propose } from '../../../../shared/helpers'
import { protectFromLiquidations } from '../../../fragments/witch/protectFromLiquidations'
import { TIMELOCK, WITCH_V1, WITCH } from '../../../../shared/constants'
import { Timelock__factory, Witch__factory } from '../../../../typechain'

const { protocol, governance, developer } = require(process.env.CONF as string)

/**
 * @dev This script unprotects the Witch v1 from liquidations.
 */

;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer as string)

  const timelock = Timelock__factory.connect(governance.get(TIMELOCK)!, ownerAcc)
  const witchV2 = Witch__factory.connect(protocol.getOrThrow(WITCH), ownerAcc)

  // Build the proposal
  const proposal = await protectFromLiquidations(witchV2, protocol.getOrThrow(WITCH_V1), false)

  // Propose, Approve & execute
  await propose(timelock, proposal, developer)
})()

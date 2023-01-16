import { CONTANGO_CAULDRON, TIMELOCK } from '../../../../../shared/constants'
import { getOwnerOrImpersonate, propose } from '../../../../../shared/helpers'
import { Cauldron__factory, Timelock__factory } from '../../../../../typechain'
import { updateSpotOraclesProposal } from '../../../../fragments/oracles/updateSpotOraclesProposal'
const { developer, protocol, governance, spotOracles } = require(process.env.CONF!)

/**
 * @dev This script updates the instrument liquidation params on the Witch.
 */
;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)

  const timelock = Timelock__factory.connect(governance.get(TIMELOCK)!, ownerAcc)
  const cauldron = Cauldron__factory.connect(protocol.get(CONTANGO_CAULDRON)!, ownerAcc)

  // 6 decimals. 1000000 == 100%
  const proposal = await updateSpotOraclesProposal(cauldron, spotOracles)

  await propose(timelock, proposal, developer)
})()

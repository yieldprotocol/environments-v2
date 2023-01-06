import { CONTANGO_WITCH, TIMELOCK } from '../../../../shared/constants'
import { getOwnerOrImpersonate, propose } from '../../../../shared/helpers'
import { ContangoWitch__factory, Timelock__factory } from '../../../../typechain'
import { setLineAndLimitProposal } from '../../../fragments/witch/setLineAndLimitProposal'

const { developer, protocol, governance, auctionLineAndLimits } = require(process.env.CONF!)

/**
 * @dev This script updates the instrument liquidation params on the Witch.
 */
;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)

  const timelock = Timelock__factory.connect(governance.get(TIMELOCK)!, ownerAcc)
  const witch = ContangoWitch__factory.connect(protocol.get(CONTANGO_WITCH)!, ownerAcc)

  const proposal = setLineAndLimitProposal(witch, auctionLineAndLimits)

  await propose(timelock, proposal, developer)
})()

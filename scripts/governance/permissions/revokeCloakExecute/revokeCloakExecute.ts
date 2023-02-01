import { getOwnerOrImpersonate, propose } from '../../../../shared/helpers'
import { Assert__factory, Timelock__factory, EmergencyBrake__factory } from '../../../../typechain'
import { ASSERT, TIMELOCK, CLOAK } from '../../../../shared/constants'
import { proposalRequired } from '../../../fragments/timelock/proposalRequired'
import { revokeCloakExecute } from '../../../fragments/permissions/revokeCloakExecute'

const { governance, protocol, executorsRevoked, previousProposalHash, developer } = require(process.env.CONF as string)

/**
 * @dev This script remove execute privileges on the cloak to one or more accounts.
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const assert = Assert__factory.connect(protocol.get(ASSERT)!, ownerAcc)
  const timelock = Timelock__factory.connect(governance.get(TIMELOCK)!, ownerAcc)
  const cloak = EmergencyBrake__factory.connect(governance.get(CLOAK)!, ownerAcc)

  let proposal: Array<{ target: string; data: string }> = []
  if (previousProposalHash !== undefined)
    proposal = proposal.concat(await proposalRequired(assert, timelock, previousProposalHash)) // Ensure that developer roles were given first
  proposal = proposal.concat(await revokeCloakExecute(cloak, executorsRevoked))

  await propose(timelock, proposal, developer)
})()

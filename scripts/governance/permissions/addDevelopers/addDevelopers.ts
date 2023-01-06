import { getOwnerOrImpersonate, proposeApproveExecute } from '../../../../shared/helpers'
import { grantDevelopersProposal } from '../../../fragments/permissions/grantDevelopers'
import { Timelock__factory, EmergencyBrake__factory } from '../../../../typechain'
import { TIMELOCK, CLOAK, MULTISIG } from '../../../../shared/constants'

const { governance, newDevelopers, developer } = require(process.env.CONF as string)

/**
 * @dev This script gives developer privileges to one or more accounts.
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const timelock = Timelock__factory.connect(governance.get(TIMELOCK)!, ownerAcc)
  const cloak = EmergencyBrake__factory.connect(governance.get(CLOAK)!, ownerAcc)

  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await grantDevelopersProposal(timelock, cloak, newDevelopers))

  await proposeApproveExecute(timelock, proposal, governance.get(MULTISIG) as string, developer)
})()

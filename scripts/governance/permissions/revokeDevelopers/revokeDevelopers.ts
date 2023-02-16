import { getOwnerOrImpersonate, propose } from '../../../../shared/helpers'
import { Timelock__factory, EmergencyBrake__factory } from '../../../../typechain'
import { TIMELOCK, CLOAK } from '../../../../shared/constants'
import { revokeDevelopers } from '../../../fragments/permissions/revokeDevelopers'

const { governance, developersRevoked, developer } = require(process.env.CONF as string)

/**
 * @dev This script remove developer privileges to one or more accounts.
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const timelock = Timelock__factory.connect(governance.get(TIMELOCK)!, ownerAcc)
  const cloak = EmergencyBrake__factory.connect(governance.get(CLOAK)!, ownerAcc)

  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await revokeDevelopers(timelock, cloak, developersRevoked))

  await propose(timelock, proposal, developer)
})()

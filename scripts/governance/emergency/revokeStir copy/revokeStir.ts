import { getOwnerOrImpersonate, propose } from '../../../../shared/helpers'
import { Timelock__factory, EmergencyBrake__factory } from '../../../../typechain'
import { TIMELOCK, CAULDRON, LADLE } from '../../../../shared/constants'
import { revokePermission } from '../../../fragments/permissions/revokeOrchestration'
import { id } from '../../../../shared/helpers'

const { developer, governance, protocol } = require(process.env.CONF as string)

/**
 * @dev This script removes 'cauldron.stir' permissions from the Ladle
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const timelock = Timelock__factory.connect(governance.get(TIMELOCK)!, ownerAcc)
  const cauldron = EmergencyBrake__factory.connect(protocol.get(CAULDRON)!, ownerAcc)

  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(
    await revokePermission(cauldron, protocol.getOrThrow(LADLE)!, id(cauldron.interface, 'stir'))
  )

  await propose(timelock, proposal, developer)
})()

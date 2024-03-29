import { getOwnerOrImpersonate, propose } from '../../../../shared/helpers'
import { Timelock__factory, Cauldron__factory, Assert__factory } from '../../../../typechain'
import { TIMELOCK, CLOAK, CAULDRON, LADLE, ASSERT } from '../../../../shared/constants'
import { revokeOrchestration } from '../../../fragments/permissions/revokeOrchestration'
import { checkPlan } from '../../../fragments/cloak/checkPlan'
import { id } from '../../../../shared/helpers'
import { EmergencyBrake__factory } from '../../../../typechain/factories/@yield-protocol/utils-v2/contracts/utils'

const { developer, governance, protocol } = require(process.env.CONF as string)

/**
 * @dev This script removes 'cauldron.stir' permissions from the Ladle
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const timelock = Timelock__factory.connect(governance.get(TIMELOCK)!, ownerAcc)
  const cloak = EmergencyBrake__factory.connect(governance.get(CLOAK)!, ownerAcc)
  const cauldron = Cauldron__factory.connect(protocol.get(CAULDRON)!, ownerAcc)
  const assert = Assert__factory.connect(protocol.get(ASSERT)!, ownerAcc)

  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(
    await revokeOrchestration(
      cloak,
      cauldron,
      protocol.getOrThrow(LADLE)!,
      id(cauldron.interface, 'stir(bytes12,bytes12,uint128,uint128)')
    )
  )

  proposal = proposal.concat(await checkPlan(cloak, assert, [protocol.getOrThrow(LADLE)!]))

  await propose(timelock, proposal, developer)
})()

import { getOwnerOrImpersonate, propose } from '../../../../../shared/helpers'
import { addLadleToCloak } from '../../../../fragments/cloak/addLadleToCloak'
import { addWitchToCloak } from '../../../../fragments/cloak/addWitchToCloak'
import { grantRoot } from '../../../../fragments/permissions/grantRoot'
import { revokeRoot } from '../../../../fragments/permissions/revokeRoot'
import {
  TIMELOCK,
  CLOAK,
  CONTANGO_CAULDRON,
  CONTANGO_LADLE,
  CONTANGO_WITCH,
  CLOAK_V1,
  ASSERT,
} from '../../../../../shared/constants'

import {
  Timelock__factory,
  EmergencyBrake__factory,
  Cauldron__factory,
  Ladle__factory,
  Witch__factory,
  Assert__factory,
  AccessControl__factory,
} from '../../../../../typechain'
import { checkPlan } from '../../../../fragments/cloak/checkPlan'

const { governance, protocol, developer, fyTokens, joins, users } = require(process.env.CONF as string)

;(async () => {
  const signerAcc = await getOwnerOrImpersonate(developer as string)

  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK)!, signerAcc)
  const cloak = EmergencyBrake__factory.connect(governance.getOrThrow(CLOAK)!, signerAcc)
  const cauldron = Cauldron__factory.connect(protocol.getOrThrow(CONTANGO_CAULDRON)!, signerAcc)
  const ladle = Ladle__factory.connect(protocol.getOrThrow(CONTANGO_LADLE)!, signerAcc)
  const witch = Witch__factory.connect(protocol.getOrThrow(CONTANGO_WITCH)!, signerAcc)
  const assert = Assert__factory.connect(protocol.getOrThrow(ASSERT)!, signerAcc)

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []

  proposal = proposal.concat(
    await revokeRoot(
      AccessControl__factory.connect(cauldron.address, cauldron.signer),
      governance.getOrThrow(CLOAK_V1)!
    )
  )
  proposal = proposal.concat(
    await grantRoot(AccessControl__factory.connect(cauldron.address, cauldron.signer), cloak.address)
  )
  proposal = proposal.concat(await addLadleToCloak(signerAcc, cloak, cauldron, ladle, fyTokens, joins))
  proposal = proposal.concat(await addWitchToCloak(signerAcc, cloak, cauldron, witch, fyTokens, joins))

  proposal = proposal.concat(await checkPlan(cloak, assert, users))

  await propose(timelock, proposal, developer)
})()

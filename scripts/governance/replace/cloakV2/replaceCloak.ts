import { getOwnerOrImpersonate, propose } from '../../../../shared/helpers'
import { addFYTokenToCloakFragment } from '../../../fragments/cloak/addFYTokenToCloakFragment'
import { addLadleToCloakFragment } from '../../../fragments/cloak/addLadleToCloakFragment'
import { addWitchToCloakFragment } from '../../../fragments/cloak/addWitchToCloakFragment'
import { addExecutorsToCloakFragment } from '../../../fragments/cloak/addExecutorsToCloakFragment'
import { grantRootFragment } from '../../../fragments/permissions/grantRootFragment'
import { revokeRootFragment } from '../../../fragments/permissions/revokeRootFragment'
import { TIMELOCK, CLOAK, CAULDRON, LADLE, WITCH, ROLLER, CLOAK_V1 } from '../../../../shared/constants'

import {
  Timelock__factory,
  EmergencyBrake__factory,
  Cauldron__factory,
  Ladle__factory,
  Witch__factory,
  Roller__factory,
} from '../../../../typechain'

const { governance, protocol, developer, executors, fyTokens, joins, strategies } = require(process.env.CONF as string)

;(async () => {
  const signerAcc = await getOwnerOrImpersonate(developer as string)

  const timelock = Timelock__factory.connect(governance.get(TIMELOCK)!, signerAcc)
  const cloak = EmergencyBrake__factory.connect(governance.get(CLOAK)!, signerAcc)
  const cauldron = Cauldron__factory.connect(protocol.get(CAULDRON)!, signerAcc)
  const ladle = Ladle__factory.connect(protocol.get(LADLE)!, signerAcc)
  const witch = Witch__factory.connect(protocol.get(WITCH)!, signerAcc)

  const hosts = []
  for (let joinAddress of joins.values()) hosts.push(joinAddress)
  for (let fyTokenAddress of fyTokens.values()) hosts.push(fyTokenAddress)
  for (let strategiesAddress of strategies.values()) hosts.push(strategiesAddress)
  hosts.push(protocol.get(CAULDRON)!)

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []

  proposal = proposal.concat(await revokeRootFragment(signerAcc, governance.get(CLOAK_V1)!, hosts))
  proposal = proposal.concat(await grantRootFragment(signerAcc, cloak.address, hosts))
  proposal = proposal.concat(await addFYTokenToCloakFragment(signerAcc, cloak, fyTokens))
  proposal = proposal.concat(await addLadleToCloakFragment(signerAcc, cloak, cauldron, ladle, fyTokens, joins))
  proposal = proposal.concat(await addWitchToCloakFragment(signerAcc, cloak, cauldron, witch, fyTokens, joins))
  proposal = proposal.concat(await addExecutorsToCloakFragment(cloak, executors))

  await propose(timelock, proposal, developer)
})()

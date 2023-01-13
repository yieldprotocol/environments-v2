import { getOwnerOrImpersonate, propose } from '../../../../shared/helpers'
import { addFYTokenToCloak } from '../../../fragments/cloak/addFYTokenToCloak'
import { addLadleToCloak } from '../../../fragments/cloak/addLadleToCloak'
import { addWitchToCloak } from '../../../fragments/cloak/addWitchToCloak'
import { addExecutorsToCloak } from '../../../fragments/cloak/addExecutorsToCloak'
import { grantRoot } from '../../../fragments/permissions/grantRoot'
import { revokeRoot } from '../../../fragments/permissions/revokeRoot'
import { TIMELOCK, CLOAK, CAULDRON, LADLE, WITCH, CLOAK_V1, GIVER, ONCHAINTEST } from '../../../../shared/constants'

import {
  Timelock__factory,
  EmergencyBrake__factory,
  Cauldron__factory,
  Ladle__factory,
  Witch__factory,
  Giver__factory,
  OnChainTest__factory,
} from '../../../../typechain'
import { checkPlan } from '../../../fragments/cloak/checkPlan'
import { addGiverToCloak } from '../../../fragments/cloak/addGiverToCloak'
import { addLeverToCloak } from '../../../fragments/cloak/addLeverToCloak'

const { governance, protocol, developer, executors, fyTokens, joins, strategies, users, levers } = require(process.env
  .CONF as string)

;(async () => {
  const signerAcc = await getOwnerOrImpersonate(developer as string)

  const timelock = Timelock__factory.connect(governance.get(TIMELOCK)!, signerAcc)
  const cloak = EmergencyBrake__factory.connect(governance.get(CLOAK)!, signerAcc)
  const cauldron = Cauldron__factory.connect(protocol.get(CAULDRON)!, signerAcc)
  const ladle = Ladle__factory.connect(protocol.get(LADLE)!, signerAcc)
  const witch = Witch__factory.connect(protocol.get(WITCH)!, signerAcc)
  const giver = Giver__factory.connect(protocol.get(GIVER)!, signerAcc)
  const onChainTest = OnChainTest__factory.connect(protocol.get(ONCHAINTEST)!, signerAcc)

  const hosts = []
  for (let joinAddress of joins.values()) hosts.push(joinAddress)
  for (let fyTokenAddress of fyTokens.values()) hosts.push(fyTokenAddress)
  for (let strategiesAddress of strategies.values()) hosts.push(strategiesAddress)
  hosts.push(protocol.get(CAULDRON)!)
  hosts.push(protocol.get(GIVER)!)

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []

  proposal = proposal.concat(await revokeRoot(signerAcc, governance.get(CLOAK_V1)!, hosts))
  proposal = proposal.concat(await grantRoot(signerAcc, cloak.address, hosts))
  proposal = proposal.concat(await addFYTokenToCloak(signerAcc, cloak, fyTokens))
  proposal = proposal.concat(await addLadleToCloak(signerAcc, cloak, cauldron, ladle, fyTokens, joins))
  proposal = proposal.concat(await addWitchToCloak(signerAcc, cloak, cauldron, witch, fyTokens, joins))
  proposal = proposal.concat(await addExecutorsToCloak(cloak, executors))
  proposal = proposal.concat(await addGiverToCloak(cloak, giver, cauldron))
  proposal = proposal.concat(await addLeverToCloak(cloak, levers, giver))
  proposal = proposal.concat(await checkPlan(cloak, onChainTest, users))

  await propose(timelock, proposal, developer)
})()

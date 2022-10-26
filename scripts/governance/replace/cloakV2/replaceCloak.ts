import { getOwnerOrImpersonate, propose } from '../../../../shared/helpers'
import { addFYTokenToCloakFragment } from '../../../fragments/cloak/addFYTokenToCloakFragment'
import { addWitchToCloakFragment } from '../../../fragments/cloak/addWitchToCloakFragment'
import { TIMELOCK, CLOAK, CAULDRON, WITCH } from '../../../../shared/constants'
import { Timelock__factory, EmergencyBrake__factory, Cauldron__factory, Witch__factory } from '../../../../typechain'

const { governance, protocol, developer, fyTokens, joins } = require(process.env.CONF as string)

;(async () => {
  const signerAcc = await getOwnerOrImpersonate(developer as string)

  const timelock = Timelock__factory.connect(governance.get(TIMELOCK)!, signerAcc)
  const cloak = EmergencyBrake__factory.connect(governance.get(CLOAK)!, signerAcc)
  const cauldron = Cauldron__factory.connect(protocol.get(CAULDRON)!, signerAcc)
  const witch = Witch__factory.connect(protocol.get(WITCH)!, signerAcc)

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await addFYTokenToCloakFragment(signerAcc, cloak, fyTokens))
  proposal = proposal.concat(await addWitchToCloakFragment(signerAcc, cloak, cauldron, witch, fyTokens, joins))

  await propose(timelock, proposal, developer)
})()

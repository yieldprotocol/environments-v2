import { getOwnerOrImpersonate, propose } from '../../../../shared/helpers'
import { addFYTokenToCloakFragment } from '../../../fragments/cloak/addFYTokenToCloakFragment'
import { TIMELOCK, CLOAK } from '../../../../shared/constants'
import { EmergencyBrake__factory, FYToken__factory, Timelock__factory } from '../../../../typechain'

const { governance, developer, fyTokens } = require(process.env.CONF as string)

;(async () => {
  const signerAcc = await getOwnerOrImpersonate(developer as string)

  const timelock = Timelock__factory.connect(governance.get(TIMELOCK)!, signerAcc)
  const cloak = EmergencyBrake__factory.connect(governance.get(CLOAK)!, signerAcc)

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []
  for (let fyToken of fyTokens.values()) {
    proposal = proposal.concat(
      await addFYTokenToCloakFragment(signerAcc, cloak, FYToken__factory.connect(fyToken, signerAcc))
    )
  }

  await propose(timelock, proposal, developer)
})()

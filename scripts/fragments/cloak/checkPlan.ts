import { EmergencyBrake } from '../../../typechain'

export const checkPlan = async (
  cloak: EmergencyBrake,
  users: Array<string>
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []

  for (let user of users) {
    proposal.push({
      target: cloak.address,
      data: cloak.interface.encodeFunctionData('check', [user]),
    })
    console.log(`cloak.check(user ${user})`)
  }
  return proposal
}

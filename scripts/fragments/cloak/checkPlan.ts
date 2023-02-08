import { EmergencyBrake, Assert } from '../../../typechain'
import { indent } from '../../../shared/helpers'

export const checkPlan = async (
  cloak: EmergencyBrake,
  assert: Assert,
  users: Array<string>,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `CHECK_PLAN`))
  const proposal: Array<{ target: string; data: string }> = []

  for (let user of users) {
    proposal.push({
      target: assert.address,
      data: assert.interface.encodeFunctionData('assertEq(address,bytes,uint256)', [
        cloak.address,
        cloak.interface.encodeFunctionData('check', [user]),
        1,
      ]),
    })
    console.log(indent(nesting, `assert.assertEq(cloak.check(${user}), true)`))
  }
  return proposal
}

import { EmergencyBrake, OnChainTest } from '../../../typechain'
import { indent } from '../../../shared/helpers'

export const checkPlan = async (
  cloak: EmergencyBrake,
  onChainTest: OnChainTest,
  users: Array<string>,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `CHECK_PLAN`))
  const proposal: Array<{ target: string; data: string }> = []

  for (let user of users) {
    proposal.push({
      target: onChainTest.address,
      data: onChainTest.interface.encodeFunctionData('valueAndCallEquator', [
        cloak.address,
        cloak.interface.encodeFunctionData('check', [user]),
        '0x0000000000000000000000000000000000000000000000000000000000000001',
      ]),
    })
    console.log(indent(nesting, `onChainTest.valueAndCallEquator(cloak.check(${user}))`))
  }
  return proposal
}

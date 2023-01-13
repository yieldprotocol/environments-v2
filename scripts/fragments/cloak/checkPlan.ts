import { EmergencyBrake, OnChainTest } from '../../../typechain'

export const checkPlan = async (
  cloak: EmergencyBrake,
  onChainTest: OnChainTest,
  users: Array<string>
): Promise<Array<{ target: string; data: string }>> => {
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
    console.log(`onChainTest.valueAndCallEquator(cloak.check(${user}))`)
  }
  return proposal
}

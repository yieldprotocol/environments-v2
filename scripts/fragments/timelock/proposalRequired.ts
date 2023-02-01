import { Assert, Timelock } from '../../../typechain'
import { indent } from '../../../shared/helpers'

export const proposalRequired = async (
  assert: Assert,
  timelock: Timelock,
  proposalHash: string,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `PROPOSAL_REQUIRED ${proposalHash}`))

  // Proposals are removed from the timelock once executed.
  return [
    {
      target: assert.address,
      data: assert.interface.encodeFunctionData('assertEq(address,bytes,uint256)', [
        timelock.address,
        timelock.interface.encodeFunctionData('proposals', [proposalHash]),
        0,
      ]),
    },
  ]
}

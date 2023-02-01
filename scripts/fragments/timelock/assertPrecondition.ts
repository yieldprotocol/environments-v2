import { Assert, Timelock } from '../../../typechain'
import { indent } from '../../../shared/helpers'

export const assertPrecondition = async (
  assert: Assert,
  timelock: Timelock,
  preconditionHash: string,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ASSERT_PRECONDITION ${preconditionHash}`))

  return [
    {
      target: assert.address,
      data: assert.interface.encodeFunctionData('assertEq(address,bytes,uint256)', [
        timelock.address,
        timelock.interface.encodeFunctionData('proposals', [preconditionHash]),
        0,
      ]),
    },
  ]
}

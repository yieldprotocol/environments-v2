import { BigNumberish } from 'ethers'
import { Timelock } from '../../../typechain'
import { indent } from '../../../shared/helpers'

export const updateTimelockDelay = async (
  timeLock: Timelock,
  delayAmount: BigNumberish,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `UPDATE_TIMELOCK_DELAY`))
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: timeLock.address,
    data: timeLock.interface.encodeFunctionData('setDelay', [delayAmount]),
  })
  console.log(indent(nesting, `setDelay to ${delayAmount}`))

  return proposal
}

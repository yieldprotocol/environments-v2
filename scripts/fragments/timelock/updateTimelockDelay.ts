import { BigNumberish } from 'ethers'
import { Timelock } from '../../../typechain'

export const updateTimelockDelay = async (
  timeLock: Timelock,
  delayAmount: BigNumberish,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: timeLock.address,
    data: timeLock.interface.encodeFunctionData('setDelay', [delayAmount]),
  })
  console.log(`${'  '.repeat(nesting)}setDelay to ${delayAmount}`)

  return proposal
}

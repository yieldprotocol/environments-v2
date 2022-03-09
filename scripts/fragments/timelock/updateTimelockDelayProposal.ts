import { BigNumberish } from 'ethers'
import { Timelock } from '../../../typechain'

export const updateTimelockDelayProposal = async (
  timeLock: Timelock,
  delayAmount: BigNumberish
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: timeLock.address,
    data: timeLock.interface.encodeFunctionData('setDelay', [delayAmount]),
  })
  console.log(`setDelay to ${delayAmount}`)

  return proposal
}

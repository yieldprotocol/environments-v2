import { Giver, YieldNotionalLever } from '../../../typechain'
import { id } from '@yield-protocol/utils-v2'
import { BigNumberish } from 'ethers'

/**
 * @dev This script orchestrates the Lever
 */

export const orchestrateNotionalIlks = async (
  lever: YieldNotionalLever,
  ilkInfo: [string, YieldNotionalLever.IlkInfoStruct][]
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []
  ilkInfo.forEach((element) => {
    proposal.push({
      target: lever.address,
      data: lever.interface.encodeFunctionData('setIlkInfo', [element[0], element[1]]),
    })
  })

  return proposal
}

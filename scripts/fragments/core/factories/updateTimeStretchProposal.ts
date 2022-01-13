import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'
import { TS } from '../../../../shared/constants'
import { PoolFactory } from '../../../../typechain'


/**
 * @dev This updates the ts parameter
 */
export const updateTimeStretchProposal = async (
  poolFactory: PoolFactory,
  timeStretch: BigNumber,
): Promise<Array<{ target: string; data: string }>>  => {
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: poolFactory.address,
    data: poolFactory.interface.encodeFunctionData('setParameter', [TS, timeStretch])
  })
  console.log(`ts set to ${timeStretch}`)

  return proposal
}

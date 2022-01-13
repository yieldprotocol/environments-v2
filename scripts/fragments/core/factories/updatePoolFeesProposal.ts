import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'
import { G1, G2 } from '../../../../shared/constants'
import { PoolFactory } from '../../../../typechain'


/**
 * @dev This updates the g1 and g2 parameters
 */
export const updatePoolFeesProposal = async (
  poolFactory: PoolFactory,
  poolFees: [BigNumber, BigNumber],
): Promise<Array<{ target: string; data: string }>>  => {
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: poolFactory.address,
    data: poolFactory.interface.encodeFunctionData('setParameter', [G1, poolFees[0]])
  })
  console.log(`g1 set to ${poolFees[0]}`)

  proposal.push({
    target: poolFactory.address,
    data: poolFactory.interface.encodeFunctionData('setParameter', [G2, poolFees[1]])
  })
  console.log(`g2 set to ${poolFees[1]}`)

  return proposal
}

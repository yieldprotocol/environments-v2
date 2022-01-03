import { ethers, waffle } from 'hardhat'
import * as hre from 'hardhat'

import ConvexStakingWrapperYieldMockArtifact from '../../../artifacts/contracts/mocks/ConvexStakingWrapperYieldMock.sol/ConvexStakingWrapperYieldMock.json'
import { ConvexStakingWrapperYieldMock } from '../../../typechain/ConvexStakingWrapperYieldMock'

const { deployContract } = waffle

/**
 * @dev This script initializes the ConvexStakingWrapperYieldMock contract
 */

export const initializeConvexWrapper = async (
  convexStakingWrapperYield: ConvexStakingWrapperYieldMock,
  convexToken: any,
  convexPool: any,
  poolId: any,
  join: any,
  cauldron: any,
  crv: any
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []

  if ((await ethers.provider.getCode(convexStakingWrapperYield.address)) === '0x')
    throw `Address ${convexStakingWrapperYield.address} contains no code`

  proposal.push({
    target: convexStakingWrapperYield.address,
    data: convexStakingWrapperYield.interface.encodeFunctionData('initialize', [
      convexToken,
      convexPool,
      poolId,
      join,
      cauldron,
      crv,
      convexToken,
    ]),
  })

  return proposal
}

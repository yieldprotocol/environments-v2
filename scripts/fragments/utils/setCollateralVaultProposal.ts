/**
 * @dev This script adds one or more assets to the cauldron, without deploying a Join or any permissioning.
 * The purpose is to reserve assetIds in the cauldron, since there might be assets (such as stEth) that we don't
 * accept as collateral, but whose asset ids we use in the oracles. The cauldron is the asset registry, so those cases
 * should be recorded. Otherwise we might be using an asset id for stEth in the oracles, and then reuse that same asset id
 * for a different asst in the Cauldron and Ladle.
 *
 * @notice The assetIds can't be already in use
 */

import { ConvexStakingWrapperYield } from '../../../typechain/ConvexStakingWrapperYield'

export const setCollateralVaultProposal = async (
  convexStakingWrapperYield: ConvexStakingWrapperYield,
  join: any
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []
  
  proposal.push({
    target: convexStakingWrapperYield.address,
    data: convexStakingWrapperYield.interface.encodeFunctionData('setCollateralVault', [join]),
  })

  return proposal
}

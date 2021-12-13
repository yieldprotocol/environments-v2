/**
 * @dev 
 */
import { ethers } from 'hardhat'

import { ConvexStakingWrapperYield } from '../../../typechain/ConvexStakingWrapperYield'

export const pointCollateralVaultProposal = async (
  convexStakingWrapperYield: ConvexStakingWrapperYield,
  join: any
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []
  
  if ((await ethers.provider.getCode(convexStakingWrapperYield.address)) === '0x') throw `Address ${convexStakingWrapperYield.address} contains no code`
  console.log(`Pointing collateral vault in ${convexStakingWrapperYield.address} to the join at ${join}`)

  proposal.push({
    target: convexStakingWrapperYield.address,
    data: convexStakingWrapperYield.interface.encodeFunctionData('point', [join]),
  })

  return proposal
}

/**
 * @dev
 */
import { ethers } from 'hardhat'

import { ConvexYieldWrapper } from '../../../typechain/ConvexYieldWrapper'

export const pointCollateralVaultProposal = async (
  convexYieldWrapper: ConvexYieldWrapper,
  join: any
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []

  if ((await ethers.provider.getCode(convexYieldWrapper.address)) === '0x')
    throw `Address ${convexYieldWrapper.address} contains no code`
  console.log(`Pointing collateral vault in ${convexYieldWrapper.address} to the join at ${join}`)

  proposal.push({
    target: convexYieldWrapper.address,
    data: convexYieldWrapper.interface.encodeFunctionData('point', [join]),
  })

  return proposal
}

/**
 * @dev
 */
import { ethers } from 'hardhat'

import { ConvexYieldWrapper } from '../../../typechain/ConvexYieldWrapper'

export const pointCollateralVault = async (
  convexYieldWrapper: ConvexYieldWrapper,
  join: any,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []

  if ((await ethers.provider.getCode(convexYieldWrapper.address)) === '0x')
    throw `Address ${convexYieldWrapper.address} contains no code`
  console.log(
    `${'  '.repeat(nesting)}Pointing collateral vault in ${convexYieldWrapper.address} to the join at ${join}`
  )

  proposal.push({
    target: convexYieldWrapper.address,
    data: convexYieldWrapper.interface.encodeFunctionData('point', [join]),
  })

  return proposal
}

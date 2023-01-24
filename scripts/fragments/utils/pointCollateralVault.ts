/**
 * @dev
 */
import { ethers } from 'hardhat'
import { ConvexYieldWrapper } from '../../../typechain/ConvexYieldWrapper'
import { indent } from '../../../shared/helpers'

export const pointCollateralVault = async (
  convexYieldWrapper: ConvexYieldWrapper,
  join: any,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `POINT_COLLATERAL_VAULT`))
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

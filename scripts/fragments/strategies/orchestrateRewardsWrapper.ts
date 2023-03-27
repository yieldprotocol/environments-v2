/**
 * @dev This script orchestrates a rewards wrapper.
 */

import { Timelock, ERC20RewardsWrapper, AccessControl__factory } from '../../../typechain'
import { revokeRoot } from '../permissions/revokeRoot'
import { indent, id } from '../../../shared/helpers'

export const orchestrateRewardsWrapper = async (
  deployer: string,
  timelock: Timelock,
  wrapper: ERC20RewardsWrapper,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ORCHESTRATE_REWARDS_WRAPPER`))
  let proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: wrapper.address,
    data: wrapper.interface.encodeFunctionData('grantRoles', [
      [
        id(wrapper.interface, 'set(address)'),
        id(wrapper.interface, 'skim(address,uint256)'),
        id(wrapper.interface, 'mint(address,uint256)'),
      ],
      timelock.address,
    ]),
  })
  console.log(indent(nesting, `rewards(${await wrapper.symbol()}).grantRoles(gov, timelock)`))

  // Revoke ROOT from the deployer
  proposal = proposal.concat(
    await revokeRoot(AccessControl__factory.connect(wrapper.address, wrapper.signer), deployer, nesting + 1)
  )

  return proposal
}

/**
 * @dev This script orchestrates Witch V2
 */

import { ROOT } from '../../../shared/constants'
import { EmergencyBrake, Timelock, VRWitch } from '../../../typechain'
import { revokeRoot } from '../permissions/revokeRoot'
import { indent, id } from '../../../shared/helpers'

export const orchestrateVRWitch = async (
  deployer: string,
  witch: VRWitch,
  timelock: Timelock,
  cloak: EmergencyBrake,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ORCHESTRATE_VR_WITCH`))
  let proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: witch.address,
    data: witch.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
  })
  console.log(indent(nesting, `ladle.grantRole(ROOT, cloak)`))

  proposal.push({
    target: witch.address,
    data: witch.interface.encodeFunctionData('grantRoles', [
      [
        id(witch.interface, 'point(bytes32,address)'),
        id(witch.interface, 'setAuctioneerReward(uint256)'),
        id(witch.interface, 'setProtected(address,bool)'),
        id(witch.interface, 'setLineAndLimit(bytes6,bytes6,uint32,uint64,uint64,uint128)'),
      ],
      timelock.address,
    ]),
  })
  console.log(indent(nesting, `witch.grantRoles(timelock)`))

  proposal = proposal.concat(await revokeRoot(witch, deployer, nesting + 1))

  return proposal
}

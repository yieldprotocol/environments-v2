/**
 * @dev This script orchestrates Witch V2
 */

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { id } from '@yield-protocol/utils-v2'
import { ROOT } from '../../../shared/constants'
import { Cauldron, EmergencyBrake, Timelock, Witch } from '../../../typechain'
import { indent } from '../../../shared/helpers'

export const orchestrateWitch = async (
  ownerAcc: SignerWithAddress,
  timelock: Timelock,
  cloak: EmergencyBrake,
  cauldron: Cauldron,
  witch: Witch,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ORCHESTRATE_WITCH`))
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: witch.address,
    data: witch.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
  })
  console.log(indent(nesting, `ladle.grantRole(ROOT, cloak)`))

  proposal.push({
    target: witch.address,
    data: witch.interface.encodeFunctionData('revokeRole', [ROOT, ownerAcc.address]),
  })
  console.log(indent(nesting, `witch.revokeRole(deployer)`))

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

  return proposal
}

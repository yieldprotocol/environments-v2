/**
 * @dev This script orchestrates Witch V2
 */

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { id } from '@yield-protocol/utils-v2'
import { ROOT } from '../../../shared/constants'
import { Cauldron, OldEmergencyBrake, Timelock, Witch } from '../../../typechain'

export const orchestrateWitchV2Fragment = async (
  ownerAcc: SignerWithAddress,
  timelock: Timelock,
  cloak: OldEmergencyBrake,
  cauldron: Cauldron,
  witch: Witch
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: witch.address,
    data: witch.interface.encodeFunctionData('revokeRole', [ROOT, ownerAcc.address]),
  })
  console.log(`witch.revokeRole(deployer)`)

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
  console.log(`witch.grantRoles(timelock)`)

  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('grantRoles', [
      [id(cauldron.interface, 'give(bytes12,address)'), id(cauldron.interface, 'slurp(bytes12,uint128,uint128)')],
      witch.address,
    ]),
  })
  console.log(`cauldron.grantRoles(witch)`)

  const plan = [
    {
      contact: cauldron.address,
      signatures: [id(cauldron.interface, 'slurp(bytes12,uint128,uint128)')],
    },
  ]

  proposal.push({
    target: cloak.address,
    data: cloak.interface.encodeFunctionData('plan', [witch.address, plan]),
  })
  console.log(`cloak.plan(witch): ${await cloak.hash(witch.address, plan)}`)

  return proposal
}

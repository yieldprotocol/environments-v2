import { id } from '@yield-protocol/utils-v2'
import { ROOT } from '../../../shared/constants'
import { Timelock, EmergencyBrake, Cauldron, Witch } from '../../../typechain'

/**
 * @dev This script orchestrates the Wand
 * The Timelock and Cloak get ROOT access. Root access is removed from the deployer.
 * The Timelock gets access to governance functions.
 * The Witch gets access to permissioned functions in the Cauldron.
 * A plan is recorded in the Cloak to isolate the Witch from the Cauldron.
 */

 export const orchestrateWitchProposal = async (
  deployer: string,
  cauldron: Cauldron,
  witch: Witch,
  timelock: Timelock,
  cloak: EmergencyBrake
): Promise<Array<{ target: string; data: string }>>  => {
  // Give access to each of the governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, revoke ROOT from the deployer
  // Orchestrate Witch to use the permissioned functions in Cauldron
  // Store a plan for isolating Cauldron from Witch
  const proposal: Array<{ target: string; data: string }> = []
  proposal.push({
    target: witch.address,
    data: witch.interface.encodeFunctionData('grantRoles', [
      [
        id(witch.interface, 'point(bytes32,address)'),
        id(witch.interface, 'setIlk(bytes6,uint32,uint64,uint96,uint24,uint8)'),
      ],
      timelock.address,
    ]),
  })
  console.log(`witch.grantRoles(gov, timelock)`)

  proposal.push({
    target: witch.address,
    data: witch.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
  })
  console.log(`witch.grantRole(ROOT, cloak)`)

  proposal.push({
    target: witch.address,
    data: witch.interface.encodeFunctionData('revokeRole', [ROOT, deployer]),
  })
  console.log(`witch.revokeRole(ROOT, deployer)`)

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

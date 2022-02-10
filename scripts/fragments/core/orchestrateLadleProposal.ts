import { id } from '@yield-protocol/utils-v2'
import { ROOT } from '../../../shared/constants'
import { Timelock, EmergencyBrake, Cauldron, Ladle } from '../../../typechain'

/**
 * @dev This script orchestrates the Ladle
 * The Cloak gets ROOT access. Root access is removed from the deployer.
 * The Timelock gets access to governance functions.
 * The Ladle gets access to the permissioned functions in Cauldron
 * Emergency plans are registered
 */

/**
 * @dev This script orchestrates the FYTokenFactory
 * The Cloak gets ROOT access. ROOT access is removed from the deployer.
 */
export const orchestrateLadleProposal = async (
  deployer: string,
  cauldron: Cauldron,
  ladle: Ladle,
  timelock: Timelock,
  cloak: EmergencyBrake
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []

  // Give access to each of the governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, revoke ROOT from the deployer
  // Orchestrate Ladle to use the permissioned functions in Cauldron
  // Store a plan for isolating Cauldron from Ladle
  proposal.push({
    target: ladle.address,
    data: ladle.interface.encodeFunctionData('grantRoles', [
      [
        id(ladle.interface, 'addJoin(bytes6,address)'),
        id(ladle.interface, 'addPool(bytes6,address)'),
        id(ladle.interface, 'addToken(address,bool)'),
        id(ladle.interface, 'addIntegration(address,bool)'),
        id(ladle.interface, 'addModule(address,bool)'),
        id(ladle.interface, 'setFee(uint256)'),
      ],
      timelock.address,
    ]),
  })
  console.log(`ladle.grantRoles(gov, timelock)`)

  proposal.push({
    target: ladle.address,
    data: ladle.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
  })
  console.log(`ladle.grantRole(ROOT, cloak)`)

  proposal.push({
    target: ladle.address,
    data: ladle.interface.encodeFunctionData('revokeRole', [ROOT, deployer]),
  })
  console.log(`ladle.revokeRole(ROOT, deployer)`)

  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('grantRoles', [
      [
        id(cauldron.interface, 'build(address,bytes12,bytes6,bytes6)'),
        id(cauldron.interface, 'destroy(bytes12)'),
        id(cauldron.interface, 'tweak(bytes12,bytes6,bytes6)'),
        id(cauldron.interface, 'give(bytes12,address)'),
        id(cauldron.interface, 'pour(bytes12,int128,int128)'),
        id(cauldron.interface, 'stir(bytes12,bytes12,uint128,uint128)'),
        id(cauldron.interface, 'roll(bytes12,bytes6,int128)'),
      ],
      ladle.address,
    ]),
  })
  console.log(`cauldron.grantRoles(ladle)`)

  const plan = [
    {
      contact: cauldron.address,
      signatures: [
        id(cauldron.interface, 'build(address,bytes12,bytes6,bytes6)'),
        id(cauldron.interface, 'destroy(bytes12)'),
        id(cauldron.interface, 'tweak(bytes12,bytes6,bytes6)'),
        id(cauldron.interface, 'give(bytes12,address)'),
        id(cauldron.interface, 'pour(bytes12,int128,int128)'),
        id(cauldron.interface, 'stir(bytes12,bytes12,uint128,uint128)'),
        id(cauldron.interface, 'roll(bytes12,bytes6,int128)'),
      ],
    },
  ]

  proposal.push({
    target: cloak.address,
    data: cloak.interface.encodeFunctionData('plan', [ladle.address, plan]),
  })
  console.log(`cloak.plan(ladle): ${await cloak.hash(ladle.address, plan)}`)

  return proposal
}

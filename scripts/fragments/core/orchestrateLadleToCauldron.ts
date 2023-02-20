import { Cauldron, Ladle, EmergencyBrake, Timelock } from '../../../typechain'
import { indent, id } from '../../../shared/helpers'

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
export const orchestrateLadleToCauldron = async (
  deployer: string,
  cauldron: Cauldron,
  ladle: Ladle,
  timelock: Timelock,
  cloak: EmergencyBrake,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ORCHESTRATE_LADLE_TO_CAULDRON`))
  const proposal: Array<{ target: string; data: string }> = []

  // Give access to each of the governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, revoke ROOT from the deployer
  // Orchestrate Ladle to use the permissioned functions in Cauldron
  // Store a plan for isolating Cauldron from Ladle

  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('grantRoles', [
      [
        id(cauldron.interface, 'build(address,bytes12,bytes6,bytes6)'),
        id(cauldron.interface, 'destroy(bytes12)'),
        id(cauldron.interface, 'tweak(bytes12,bytes6,bytes6)'),
        id(cauldron.interface, 'pour(bytes12,int128,int128)'),
        id(cauldron.interface, 'stir(bytes12,bytes12,uint128,uint128)'),
        id(cauldron.interface, 'roll(bytes12,bytes6,int128)'),
      ],
      ladle.address,
    ]),
  })
  console.log(indent(nesting, `cauldron.grantRoles(ladle)`))

  proposal.push({
    target: cloak.address,
    data: cloak.interface.encodeFunctionData('add', [
      ladle.address,
      [
        {
          host: cauldron.address,
          signature: id(cauldron.interface, 'build(address,bytes12,bytes6,bytes6)'),
        },
        {
          host: cauldron.address,
          signature: id(cauldron.interface, 'destroy(bytes12)'),
        },
        {
          host: cauldron.address,
          signature: id(cauldron.interface, 'tweak(bytes12,bytes6,bytes6)'),
        },
        {
          host: cauldron.address,
          signature: id(cauldron.interface, 'pour(bytes12,int128,int128)'),
        },
        {
          host: cauldron.address,
          signature: id(cauldron.interface, 'stir(bytes12,bytes12,uint128,uint128)'),
        },
        {
          host: cauldron.address,
          signature: id(cauldron.interface, 'roll(bytes12,bytes6,int128)'),
        },
      ],
    ]),
  })
  console.log(indent(nesting, `cloak.add(ladle to cauldron)`))

  return proposal
}

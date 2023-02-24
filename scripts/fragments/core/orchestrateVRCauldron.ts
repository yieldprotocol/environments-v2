import { id } from '@yield-protocol/utils-v2'
import { ROOT } from '../../../shared/constants'
import { EmergencyBrake, Timelock, VRCauldron } from '../../../typechain'
import { revokeRoot } from '../permissions/revokeRoot'
import { indent } from '../../../shared/helpers'

/**
 * @dev This script orchestrates the Cauldron
 * The Cloak gets ROOT access. Root access is removed from the deployer.
 * The Timelock gets access to governance functions.
 */
export const orchestrateVRCauldron = async (
  deployer: string,
  cauldron: VRCauldron,
  timelock: Timelock,
  cloak: EmergencyBrake,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ORCHESTRATE_VR_CAULDRON`))
  let proposal: Array<{ target: string; data: string }> = []
  // Give access to each of the governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, revoke ROOT from the deployer
  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('grantRoles', [
      [
        id(cauldron.interface, 'addAsset(bytes6,address)'),
        id(cauldron.interface, 'addBase(bytes6)'),
        id(cauldron.interface, 'addIlks(bytes6,bytes6[])'),
        id(cauldron.interface, 'setDebtLimits(bytes6,bytes6,uint96,uint24,uint8)'),
        id(cauldron.interface, 'setRateOracle(bytes6,address)'),
        id(cauldron.interface, 'setSpotOracle(bytes6,bytes6,address,uint32)'),
      ],
      timelock.address,
    ]),
  })
  console.log(indent(nesting, `cauldron.grantRoles(gov, timelock)`))

  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
  })
  console.log(indent(nesting, `cauldron.grantRole(ROOT, cloak)`))

  proposal = proposal.concat(await revokeRoot(cauldron, deployer, nesting + 1))

  return proposal
}

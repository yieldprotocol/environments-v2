import { id } from '@yield-protocol/utils-v2'
import { ROOT } from '../../../shared/constants'
import { Timelock, EmergencyBrake, Cauldron } from '../../../typechain'

/**
 * @dev This script orchestrates the Cauldron
 * The Cloak gets ROOT access. Root access is removed from the deployer.
 * The Timelock gets access to governance functions.
 */

/**
 * @dev This script orchestrates the FYTokenFactory
 * The Cloak gets ROOT access. ROOT access is removed from the deployer.
 */
 export const orchestrateCauldronProposal = async (
  deployer: string,
  cauldron: Cauldron,
  timelock: Timelock,
  cloak: EmergencyBrake
): Promise<Array<{ target: string; data: string }>>  => {
  const proposal: Array<{ target: string; data: string }> = []
  // Give access to each of the governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, revoke ROOT from the deployer
  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('grantRoles', [
      [
        id(cauldron.interface, 'addAsset(bytes6,address)'),
        id(cauldron.interface, 'addSeries(bytes6,bytes6,address)'),
        id(cauldron.interface, 'addIlks(bytes6,bytes6[])'),
        id(cauldron.interface, 'setDebtLimits(bytes6,bytes6,uint96,uint24,uint8)'),
        id(cauldron.interface, 'setLendingOracle(bytes6,address)'),
        id(cauldron.interface, 'setSpotOracle(bytes6,bytes6,address,uint32)'),
      ],
      timelock.address,
    ]),
  })
  console.log(`cauldron.grantRoles(gov, timelock)`)

  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
  })
  console.log(`cauldron.grantRole(ROOT, cloak)`)

  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('revokeRole', [ROOT, deployer]),
  })
  console.log(`cauldron.revokeRole(ROOT, deployer)`)

  return proposal
}

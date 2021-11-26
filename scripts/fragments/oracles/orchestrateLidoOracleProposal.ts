import { id } from '@yield-protocol/utils-v2'
import { ROOT } from '../../../shared/constants'
import { LidoOracle } from '../../../typechain/LidoOracle'
import { EmergencyBrake } from '../../../typechain/EmergencyBrake'
import { Timelock } from '../../../typechain/Timelock'

/**
 * @dev This script permissions the LidoOracle
 *
 * Expects the Timelock to have ROOT permissions on the LidoOracle.
 * The Cloak gets ROOT access. Root access is removed from the deployer.
 * The Timelock gets access to governance functions.
 */

export const orchestrateLidoOracleProposal = async (
    deployer: string, 
    lidoOracle: LidoOracle,
    timelock: Timelock,
    cloak: EmergencyBrake
  ): Promise<Array<{ target: string; data: string }>>  => {

  // Give access to each of the governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, revoke ROOT from the deployer
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
      target: lidoOracle.address,
      data: lidoOracle.interface.encodeFunctionData('grantRoles', [
          [
              id(lidoOracle.interface, 'setSource(address)'),
          ],
          timelock.address
      ])
  })
  console.log(`lidoOracle.grantRoles(gov, timelock)`)

  proposal.push({
      target: lidoOracle.address,
      data: lidoOracle.interface.encodeFunctionData('grantRole', [ROOT, cloak.address])
  })
  console.log(`lidoOracle.grantRole(ROOT, cloak)`)

  proposal.push({
      target: lidoOracle.address,
      data: lidoOracle.interface.encodeFunctionData('revokeRole', [ROOT, deployer])
  })
  console.log(`lidoOracle.revokeRole(ROOT, deployer)`)

  return proposal
}
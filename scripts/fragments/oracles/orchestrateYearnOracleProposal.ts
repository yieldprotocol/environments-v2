import { id } from '@yield-protocol/utils-v2'
import { ROOT } from '../../../shared/constants'
import { YearnVaultMultiOracle } from '../../../typechain/YearnVaultMultiOracle'
import { EmergencyBrake } from '../../../typechain/EmergencyBrake'
import { Timelock } from '../../../typechain/Timelock'

/**
 * @dev This script permissions the YearnVaultMultiOracle
 *
 * Expects the Timelock to have ROOT permissions on the YearnVaultMultiOracle.
 * The Cloak gets ROOT access. Root access is removed from the deployer.
 * The Timelock gets access to governance functions.
 */

export const orchestrateYearnOracleProposal = async (
    deployer: string, 
    yearnOracle: YearnVaultMultiOracle,
    timelock: Timelock,
    cloak: EmergencyBrake
  ): Promise<Array<{ target: string; data: string }>>  => {

  // Give access to each of the governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, revoke ROOT from the deployer
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
      target: yearnOracle.address,
      data: yearnOracle.interface.encodeFunctionData('grantRoles', [
          [
              id(yearnOracle.interface, 'setSource(bytes6,bytes6,address)'),
          ],
          timelock.address
      ])
  })
  console.log(`yearnOracle.grantRoles(gov, timelock)`)

  proposal.push({
      target: yearnOracle.address,
      data: yearnOracle.interface.encodeFunctionData('grantRole', [ROOT, cloak.address])
  })
  console.log(`yearnOracle.grantRole(ROOT, cloak)`)

  proposal.push({
      target: yearnOracle.address,
      data: yearnOracle.interface.encodeFunctionData('revokeRole', [ROOT, deployer])
  })
  console.log(`yearnOracle.revokeRole(ROOT, deployer)`)

  return proposal
}
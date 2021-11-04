import { id } from '@yield-protocol/utils-v2'

import { CompositeMultiOracle, EmergencyBrake, Timelock } from '../../../typechain'

/**
 * @dev This script deploys the CompositeMultiOracles
 *
 * It takes as inputs the governance and protocol json address files.
 * The protocol json address file is updated.
 * The Timelock and Cloak get ROOT access. Root access is removed from the deployer.
 * The Timelock gets access to governance functions.
 */

export const orchestrateCompositeOracleProposal = async (
    ownerAcc: any, 
    compositeOracle: CompositeMultiOracle,
    timelock: Timelock,
    cloak: EmergencyBrake
  ): Promise<Array<{ target: string; data: string }>>  => {
  const ROOT = await compositeOracle.ROOT()

  // Give access to each of the governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, revoke ROOT from the deployer
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: compositeOracle.address,
    data: compositeOracle.interface.encodeFunctionData('grantRoles', [
        [
            id(compositeOracle.interface, 'setSource(bytes6,bytes6,address)'),
            id(compositeOracle.interface, 'setPath(bytes6,bytes6,bytes6[])'),
        ],
        timelock.address
    ])
  })
  console.log(`compositeOracle.grantRoles(gov, timelock)`)

  proposal.push({
    target: compositeOracle.address,
    data: compositeOracle.interface.encodeFunctionData('grantRole', [ROOT, cloak.address])
  })
  console.log(`compositeOracle.grantRole(ROOT, cloak)`)

  proposal.push({
    target: compositeOracle.address,
    data: compositeOracle.interface.encodeFunctionData('revokeRole', [ROOT, ownerAcc.address])
  })
  console.log(`compositeOracle.revokeRole(ROOT, deployer)`)

  return proposal
}
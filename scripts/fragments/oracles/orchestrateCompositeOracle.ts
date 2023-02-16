import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { id } from '@yield-protocol/utils-v2'
import { ROOT } from '../../../shared/constants'
import { CompositeMultiOracle, EmergencyBrake, Timelock } from '../../../typechain'
import { revokeRoot } from '../permissions/revokeRoot'
import { indent } from '../../../shared/helpers'

/**
 * @dev This script permissions a CompositeMultiOracle
 *
 * The Timelock and Cloak get ROOT access. Root access is removed from the deployer.
 * The Timelock gets access to governance functions.
 */

export const orchestrateCompositeOracle = async (
  deployer: string,
  compositeOracle: CompositeMultiOracle,
  timelock: Timelock,
  cloak: EmergencyBrake,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ORCHESTRATE_COMPOSITE_ORACLE`))
  // Give access to each of the governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, revoke ROOT from the deployer
  let proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: compositeOracle.address,
    data: compositeOracle.interface.encodeFunctionData('grantRoles', [
      [
        id(compositeOracle.interface, 'setSource(bytes6,bytes6,address)'),
        id(compositeOracle.interface, 'setPath(bytes6,bytes6,bytes6[])'),
      ],
      timelock.address,
    ]),
  })
  console.log(indent(nesting, `compositeOracle.grantRoles(gov, timelock)`))

  proposal.push({
    target: compositeOracle.address,
    data: compositeOracle.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
  })
  console.log(indent(nesting, `compositeOracle.grantRole(ROOT, cloak)`))

  proposal = proposal.concat(await revokeRoot(compositeOracle, deployer, nesting + 1))

  return proposal
}

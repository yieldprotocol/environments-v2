import { id } from '@yield-protocol/utils-v2'

import { Timelock, EmergencyBrake, UniswapV3Oracle } from '../../../../typechain/'

/**
 * @dev This script permissions the UniswapV3Oracle
 *
 * Expects the Timelock to have ROOT permissions on the UniswapOracle.
 * The Cloak gets ROOT access. Root access is removed from the deployer.
 * The Timelock gets access to governance functions.
 */

export const orchestrateUniswapOracleProposal = async (
    ownerAcc: any, 
    uniswapOracle: UniswapV3Oracle,
    timelock: Timelock,
    cloak: EmergencyBrake
  ): Promise<Array<{ target: string; data: string }>>  => {
  const ROOT = await uniswapOracle.ROOT()

  // Give access to each of the governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, revoke ROOT from the deployer
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
      target: uniswapOracle.address,
      data: uniswapOracle.interface.encodeFunctionData('grantRoles', [
          [
              id(uniswapOracle.interface, 'setSource(bytes6,bytes6,address)'),
              id(uniswapOracle.interface, 'setSecondsAgo(uint32)'),
          ],
          timelock.address
      ])
  })
  console.log(`uniswapOracle.grantRoles(gov, timelock)`)

  proposal.push({
      target: uniswapOracle.address,
      data: uniswapOracle.interface.encodeFunctionData('grantRole', [ROOT, cloak.address])
  })
  console.log(`uniswapOracle.grantRole(ROOT, cloak)`)

  proposal.push({
      target: uniswapOracle.address,
      data: uniswapOracle.interface.encodeFunctionData('revokeRole', [ROOT, ownerAcc.address])
  })
  console.log(`uniswapOracle.revokeRole(ROOT, deployer)`)

  return proposal
}
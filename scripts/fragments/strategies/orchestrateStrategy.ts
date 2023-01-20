/**
 * @dev This script orchestrates one or more strategies in the protocol.
 *
 * The Timelock gets access to governance functions in the new Strategies.
 * The ROOT role is revoked from the deployer
 */

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { id } from '@yield-protocol/utils-v2'
import { getName } from '../../../shared/helpers'
import { Timelock, Ladle, Strategy, AccessControl__factory } from '../../../typechain'
import { removeDeployer } from '../core/removeDeployer'

export const orchestrateStrategy = async (
  multisig: string,
  timelock: Timelock,
  ladle: Ladle,
  strategy: Strategy
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []

  // Revoke ROOT from the deployer
  proposal = proposal.concat(await removeDeployer(AccessControl__factory.connect(strategy.address, strategy.signer)))

  proposal.push({
    target: strategy.address,
    data: strategy.interface.encodeFunctionData('grantRoles', [
      [
        id(strategy.interface, 'setRewardsToken(address)'),
        id(strategy.interface, 'setRewards(uint32,uint32,uint96)'),
        id(strategy.interface, 'invest(address)'),
        id(strategy.interface, 'eject()'),
        id(strategy.interface, 'restart()'),
      ],
      timelock.address,
    ]),
  })
  console.log(`strategy(${strategy.address}).grantRoles(gov, timelock)`)

  proposal.push({
    target: strategy.address,
    data: strategy.interface.encodeFunctionData('grantRoles', [[id(strategy.interface, 'eject()')], multisig]),
  })
  console.log(`strategy(${strategy.address}).grantRoles(gov, timelock)`)

  // Add the strategy as an integration to the Ladle
  proposal.push({
    target: ladle.address,
    data: ladle.interface.encodeFunctionData('addIntegration', [strategy.address, true]),
  })
  console.log(`ladle.addIntegration(${strategy.address})`)

  // Add the strategy as an token to the Ladle
  proposal.push({
    target: ladle.address,
    data: ladle.interface.encodeFunctionData('addToken', [strategy.address, true]),
  })
  console.log(`ladle.addToken(${strategy.address})`)

  return proposal
}

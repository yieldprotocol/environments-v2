/**
 * @dev This script orchestrates one or more strategies in the protocol.
 *
 * The Timelock gets access to governance functions in the new Strategies.
 * The ROOT role is revoked from the deployer
 */

import { id } from '@yield-protocol/utils-v2'
import { ROOT } from '../../../shared/constants'
import { getName } from '../../../shared/helpers'
import { Timelock, Strategy__factory, Ladle } from '../../../typechain'

export const orchestrateStrategies = async (
  ownerAcc: any,
  deployer: string,
  multisig: string,
  timelock: Timelock,
  ladle: Ladle,
  strategies: Map<string, string>
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []

  for (let [strategyId, strategyAddress] of strategies) {
    const strategy = Strategy__factory.connect(strategyAddress, ownerAcc)

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
    console.log(`strategy(${getName(strategyId)}).grantRoles(gov, timelock)`)

    proposal.push({
      target: strategy.address,
      data: strategy.interface.encodeFunctionData('grantRoles', [[id(strategy.interface, 'eject()')], multisig]),
    })
    console.log(`strategy(${getName(strategyId)}).grantRoles(gov, timelock)`)

    proposal.push({
      target: strategy.address,
      data: strategy.interface.encodeFunctionData('revokeRole', [ROOT, deployer]),
    })
    console.log(`strategy(${getName(strategyId)}).revokeRole(ROOT, deployer)`)

    // Add the strategy as an integration to the Ladle
    proposal.push({
      target: ladle.address,
      data: ladle.interface.encodeFunctionData('addIntegration', [strategyAddress, true]),
    })
    console.log(`ladle.addIntegration(${getName(strategyId)}, ${strategyAddress})`)

    // Add the strategy as an token to the Ladle
    proposal.push({
      target: ladle.address,
      data: ladle.interface.encodeFunctionData('addToken', [strategyAddress, true]),
    })
    console.log(`ladle.addToken(${getName(strategyId)}, ${strategyAddress})`)
  }

  return proposal
}

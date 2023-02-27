/**
 * @dev This script orchestrates one or more strategies in the protocol.
 */

import { Timelock, Ladle, AccessControl__factory, Strategy__factory } from '../../../typechain'
import { Strategy } from '../../governance/confTypes'
import { revokeRoot } from '../permissions/revokeRoot'
import { getName, indent, id } from '../../../shared/helpers'

export const orchestrateStrategy = async (
  deployer: string,
  multisig: string,
  timelock: Timelock,
  ladle: Ladle,
  strategy: Strategy,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ORCHESTRATE_STRATEGY`))
  let proposal: Array<{ target: string; data: string }> = []

  const strategyContract = Strategy__factory.connect(strategy.address, timelock.signer)
  const strategyInterface = strategyContract.interface

  proposal.push({
    target: strategy.address,
    data: strategyInterface.encodeFunctionData('grantRoles', [
      [
        id(strategyInterface, 'setRewardsToken(address)'),
        id(strategyInterface, 'setRewards(uint32,uint32,uint96)'),
        id(strategyInterface, 'init(address)'),
        id(strategyInterface, 'invest(address)'),
        id(strategyInterface, 'eject()'),
        id(strategyInterface, 'restart()'),
      ],
      timelock.address,
    ]),
  })
  console.log(indent(nesting, `strategy(${getName(strategy.assetId)}).grantRoles(gov, timelock)`))

  proposal.push({
    target: strategy.address,
    data: strategyInterface.encodeFunctionData('grantRoles', [[id(strategyInterface, 'eject()')], multisig]),
  })
  console.log(indent(nesting, `strategy(${getName(strategy.assetId)}).grantRoles(eject, multisig)`))

  // Add the strategy as an integration to the Ladle
  proposal.push({
    target: ladle.address,
    data: ladle.interface.encodeFunctionData('addIntegration', [strategy.address, true]),
  })
  console.log(indent(nesting, `ladle.addIntegration(${getName(strategy.assetId)})`))

  // Add the strategy as an token to the Ladle
  proposal.push({
    target: ladle.address,
    data: ladle.interface.encodeFunctionData('addToken', [strategy.address, true]),
  })
  console.log(indent(nesting, `ladle.addToken(${getName(strategy.assetId)})`))

  // Revoke ROOT from the deployer
  proposal = proposal.concat(
    await revokeRoot(AccessControl__factory.connect(strategy.address, ladle.signer), deployer, nesting + 1)
  )

  return proposal
}

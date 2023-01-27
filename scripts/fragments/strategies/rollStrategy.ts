/**
 * @dev This script rolls a strategy to a matching uninitialized pool.
 */

import { Strategy } from '../../governance/confTypes'
import { investStrategy } from './investStrategy'
import { divestStrategy } from './divestStrategy'
import { getName, indent } from '../../../shared/helpers'

export const rollStrategy = async (
  ownerAcc: any,
  strategy: Strategy,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ROLL_STRATEGY ${getName(strategy.assetId)}`))
  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []

  proposal = proposal.concat(await divestStrategy(ownerAcc, strategy, nesting + 1))
  proposal = proposal.concat(await investStrategy(ownerAcc, strategy, nesting + 1))

  return proposal
}

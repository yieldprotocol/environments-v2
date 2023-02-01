/**
 * @dev This script rolls a strategy to a matching uninitialized pool.
 */

import { Strategy__factory } from '../../../typechain'
import { Strategy } from '../../governance/confTypes'
import { getName, indent } from '../../../shared/helpers'

export const divestStrategy = async (
  ownerAcc: any,
  strategy: Strategy,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ROLL_STRATEGY ${getName(strategy.assetId)}`))
  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []

  const strategyContract = Strategy__factory.connect(strategy.address, ownerAcc)
  const strategyInterface = strategyContract.interface

  proposal.push({
    target: strategy.address,
    data: strategyInterface.encodeFunctionData('divest'),
  })
  console.log(indent(nesting, `Strategy ${getName(strategy.assetId)} divested`))

  return proposal
}

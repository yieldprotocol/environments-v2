/**
 * @dev This script migrates strategies from v1 to v2.
 */

import { StrategyV1__factory } from '../../../typechain'
import { MAX256 } from '../../../shared/constants'

export const migrateStrategiesProposal = async (
  ownerAcc: any,
  migrateData: Array<[string, string, string]>
): Promise<Array<{ target: string; data: string }>> => {
  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []

  for (let [oldStrategyAddress, newSeriesId, newStrategyAddress] of migrateData) {
    console.log(`Using strategy V1 at ${oldStrategyAddress}`)

    const oldStrategy = StrategyV1__factory.connect(oldStrategyAddress, ownerAcc)

    console.log(`Using Strategy V2 at ${newStrategyAddress} for ${newSeriesId}`)

    proposal.push({
      target: oldStrategy.address,
      data: oldStrategy.interface.encodeFunctionData('setNextPool', [newStrategyAddress, newSeriesId]),
    })

    proposal.push({
      target: oldStrategy.address,
      data: oldStrategy.interface.encodeFunctionData('startPool', [0, MAX256]),
    })

    console.log(`Strategy ${oldStrategyAddress} rolled onto ${newStrategyAddress}`)
  }

  return proposal
}

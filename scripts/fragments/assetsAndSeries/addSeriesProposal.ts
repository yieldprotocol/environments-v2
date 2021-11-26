/**
 * @dev This script adds one or more series to the protocol.
 *
 * It takes as inputs the governance and protocol json address files.
 * It uses the Wand to add the series:
 *  - Deploying a fyToken and adds it to the Cauldron, permissioned for the specified ilks.
 *  - Deploying a pool and adding it to the Ladle, which gets permissions to mint and burn.
 * @notice Adding one series is 6M gas, maybe add just one per proposal
 */

import { Wand } from '../../../typechain/Wand'

export const addSeriesProposal = async (
  wand: Wand,
  newSeries: Array<[string, string, number, string[], string, string]>
): Promise<Array<{ target: string; data: string }>>  => {
  // Each series costs 10M gas to deploy, so there is no bundling of several series in a single proposal
  let proposal: Array<{ target: string; data: string }> = []
  for (let [seriesId, baseId, maturity, ilkIds, name, symbol] of newSeries) {
    // Build the proposal    
    proposal.push({
      target: wand.address,
      data: wand.interface.encodeFunctionData('addSeries', [seriesId, baseId, maturity, ilkIds, name, symbol]),
    })
  }

  return proposal
}

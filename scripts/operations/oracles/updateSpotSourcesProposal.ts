/**
 * @dev This script replaces one or more spot data sources in a MultiOracle.
 *
 * It takes as inputs the governance, protocol and spotSources json address files.
 * It rewrites the spotSources json address file.
 * @notice This can be used to update RATE and CHI by entering those as quoteId, and using a rate and chi oracle
 */

import { ethers } from 'hardhat'
import * as fs from 'fs'
import { jsonToMap } from '../../../shared/helpers'

import { ChainlinkMultiOracle } from '../../../typechain'

export const updateSpotSourcesProposal = async (
  ownerAcc: any, 
  protocol: Map<string, string>,
  spotSources: [string, string, string, string, string, string][]
): Promise<Array<{ target: string; data: string }>>  => {
  const proposal: Array<{ target: string; data: string }> = []
  for (let [baseId, baseAddress, quoteId, quoteAddress, oracleName, sourceAddress] of spotSources) {
    if ((await ethers.provider.getCode(sourceAddress)) === '0x') throw `Address ${sourceAddress} contains no code`

    const oracle = (await ethers.getContractAt(
      'ChainlinkMultiOracle',
      protocol.get(oracleName) as string,
      ownerAcc
    )) as unknown as ChainlinkMultiOracle
    console.log(`Setting up ${sourceAddress} as the source for ${baseId}/${quoteId} at ${oracle.address}`)

    proposal.push({
      target: oracle.address,
      data: oracle.interface.encodeFunctionData('setSource', [
        baseId,
        baseAddress,
        quoteId,
        quoteAddress,
        sourceAddress,
      ]),
    })
  }

  return proposal
}

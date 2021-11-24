/**
 * @dev This script replaces one or more spot data sources in a MultiOracle.
 *
 * It takes as inputs the governance, protocol and spotSources json address files.
 * It rewrites the spotSources json address file.
 * @notice This can be used to update RATE and CHI by entering those as quoteId, and using a rate and chi oracle
 */

import { ethers } from 'hardhat'
import { ZERO_ADDRESS } from '../../../shared/constants'
import { getContract, readAddressMappingIfExists } from '../../../shared/helpers'

import { ChainlinkMultiOracle, ChainlinkUSDMultiOracle } from '../../../typechain'

export const updateChainlinkSourcesProposal = async (
  oracle: ChainlinkMultiOracle,
  spotSources: [string, string, string, string, string, string][]
): Promise<Array<{ target: string; data: string }>>  => {
  const proposal: Array<{ target: string; data: string }> = []
  for (let [baseId, baseAddress, quoteId, quoteAddress, oracleName, sourceAddress] of spotSources) {
    if ((await ethers.provider.getCode(sourceAddress)) === '0x') throw `Address ${sourceAddress} contains no code`
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

export class SpotSourceUSD {
  constructor (readonly baseId: string, 
    readonly baseAddress: string, 
    readonly oracleName: string, 
    readonly sourceAddress: string) {}
}

export const updateChainlinkUSDSourcesProposal = async (
  ownerAcc: any, 
  spotSources: SpotSourceUSD[]
): Promise<Array<{ target: string; data: string }>>  => {
  const protocol = readAddressMappingIfExists('protocol.json');
  const proposal: Array<{ target: string; data: string }> = []
  for (let spotSource of spotSources) {
    if ((await ethers.provider.getCode(spotSource.sourceAddress)) === '0x') {
      throw `Address ${spotSource.sourceAddress}  contains no code`
    }
    if (spotSource.baseAddress == ZERO_ADDRESS) {
      throw new Error(`No base address for ${spotSource.baseId}`);
    }
    if (spotSource.sourceAddress == ZERO_ADDRESS) {
      throw new Error(`No source address for ${spotSource.baseId}`);
    }

    const oracle = await getContract<ChainlinkUSDMultiOracle>(ownerAcc, 
        'ChainlinkUSDMultiOracle',
        protocol.get(spotSource.oracleName) as string);

    const existing_source = await oracle.sources(spotSource.baseId);
    if (existing_source[0] != ZERO_ADDRESS) {
      console.log(`WARNING: ${spotSource.sourceAddress} already has spot source: ${existing_source[0]}`)
      if (existing_source[0] != spotSource.sourceAddress) {
        throw new Error(`${spotSource.sourceAddress} already has spot source: ${existing_source[0]}`)
      }
    }

    console.log(`Setting up ${spotSource.sourceAddress} as the source for ${spotSource.baseId}/USD (${spotSource.baseAddress}) at ${oracle.address}`);

    proposal.push({
      target: oracle.address,
      data: oracle.interface.encodeFunctionData('setSource', [
        spotSource.baseId,
        spotSource.baseAddress,
        spotSource.sourceAddress
      ]),
    })
  }

  return proposal
}

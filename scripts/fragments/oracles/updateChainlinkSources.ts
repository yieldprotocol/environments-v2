/**
 * @dev This script replaces one or more spot data sources in a MultiOracle.
 *
 * It takes as inputs the governance, protocol and spotSources json address files.
 * It rewrites the spotSources json address file.
 * @notice This can be used to update RATE and CHI by entering those as quoteId, and using a rate and chi oracle
 */

import { ethers } from 'hardhat'

import { ChainlinkMultiOracle } from '../../../typechain'
import { OracleSource } from '../../governance/confTypes'
import { getName, indent } from '../../../shared/helpers'

export const updateChainlinkSources = async (
  oracle: ChainlinkMultiOracle,
  spotSources: OracleSource[],
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `UPDATE_CHAINLINK_SOURCES`))
  const proposal: Array<{ target: string; data: string }> = []
  for (let source of spotSources) {
    if ((await ethers.provider.getCode(source.sourceAddress)) === '0x')
      throw `Address ${source.sourceAddress} contains no code`
    console.log(
      `Setting up ${source.sourceAddress} as the source for ${getName(source.baseId)}/${getName(source.quoteId)} at ${
        oracle.address
      }`
    )

    // TODO: We can now instantiate sourceAddress into a ChainlinkV3Aggregator and read the price feed, which would be a better test

    proposal.push({
      target: oracle.address,
      data: oracle.interface.encodeFunctionData('setSource', [
        source.baseId,
        source.baseAddress,
        source.quoteId,
        source.quoteAddress,
        source.sourceAddress,
      ]),
    })
  }

  return proposal
}

/**
 * @dev This script replaces one or more data sources in a CompositeMultiOracle.
 * These data sources are IOracle contracts that will be used either directly or as part of paths.
 */

import { bytesToBytes32, bytesToString } from '../../../shared/helpers'
import { WAD, ZERO_ADDRESS } from '../../../shared/constants'
import { CompositeMultiOracle, CompositeMultiOracle__factory, IOracle__factory } from '../../../typechain'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

export const updateCompositeSourcesProposal = async (
  ownerAcc: SignerWithAddress,
  compositeOracle: CompositeMultiOracle,
  compositeSources: Array<[string, string, string]>,
  overrideExistent: boolean = true
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []

  const added = new Set<string>()

  for (let [baseId, quoteId, oracleAddress] of compositeSources) {
    const pair = `${bytesToString(baseId)}/${bytesToString(quoteId)}`

    if (added.has(pair) || added.has(`${bytesToString(quoteId)}/${bytesToString(baseId)}`)) {
      console.log(`${pair} already set, skipping`)
      continue
    }
    added.add(pair)

    const oracle = CompositeMultiOracle__factory.connect(oracleAddress, ownerAcc)

    const existent = await oracle.sources(baseId, quoteId)
    if (existent === ZERO_ADDRESS || overrideExistent) {
      // This step in the proposal ensures that the source has been added to the oracle, `peek` will fail with 'Source not found' if not
      console.log(`CompositeMultiOracle: checking ${pair} on ${oracleAddress}`)
      proposal.push({
        target: oracle.address,
        data: oracle.interface.encodeFunctionData('peek', [bytesToBytes32(baseId), bytesToBytes32(quoteId), WAD]),
      })

      proposal.push({
        target: compositeOracle.address,
        data: compositeOracle.interface.encodeFunctionData('setSource', [baseId, quoteId, oracle.address]),
      })
      console.log(`CompositeMultiOracle: pair: ${pair} set to ${oracle.address}`)
    }
  }

  return proposal
}

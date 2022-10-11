/**
 * @dev This script replaces one or more data sources in a CompositeMultiOracle.
 * These data sources are IOracle contracts that will be used either directly or as part of paths.
 */

import { bytesToBytes32, bytesToString } from '../../../shared/helpers'
import { WAD } from '../../../shared/constants'
import { CompositeMultiOracle, IOracle__factory } from '../../../typechain'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

export const updateCompositeSourcesProposal = async (
  ownerAcc: SignerWithAddress,
  compositeOracle: CompositeMultiOracle,
  compositeSources: Array<[string, string, string]>
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []
  for (let [baseId, quoteId, oracleAddress] of compositeSources) {
    const oracle = IOracle__factory.connect(oracleAddress, ownerAcc)
    // This step in the proposal ensures that the source has been added to the oracle, `peek` will fail with 'Source not found' if not
    console.log(`Adding ${baseId}/${quoteId} from ${oracleAddress}`)
    proposal.push({
      target: oracle.address,
      data: oracle.interface.encodeFunctionData('peek', [bytesToBytes32(baseId), bytesToBytes32(quoteId), WAD]),
    })

    proposal.push({
      target: compositeOracle.address,
      data: compositeOracle.interface.encodeFunctionData('setSource', [baseId, quoteId, oracle.address]),
    })
    console.log(`pair: ${bytesToString(baseId)}/${bytesToString(quoteId)} -> ${oracle.address}`)
  }

  return proposal
}

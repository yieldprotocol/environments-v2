/**
 * @dev This script replaces one or more data sources in a CompositeMultiOracle.
 * These data sources are IOracle contracts that will be used either directly or as part of paths.
 */

import { ethers } from 'hardhat'
import { bytesToString, bytesToBytes32 } from '../../../shared/helpers'
import { WAD } from '../../../shared/constants'
import { CompositeMultiOracle } from '../../../typechain'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

export const updateCompositeSourcesProposal = async (
  ownerAcc: SignerWithAddress,
  protocol: Map<string, string>,
  compositeOracle: CompositeMultiOracle,
  compositePairs: [string, string, string][]
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []
  for (let [baseId, quoteId, oracleName] of compositePairs) {
    const oracle = await ethers.getContractAt('IdentityOracle', protocol.get(oracleName) as string, ownerAcc)
    // This step in the proposal ensures that the source has been added to the oracle, `peek` will fail with 'Source not found' if not
    const innerOracle = await ethers.getContractAt('IOracle', oracle.address, ownerAcc)
    console.log(`Adding ${baseId}/${quoteId} from ${oracle.address}`)
    proposal.push({
      target: innerOracle.address,
      data: innerOracle.interface.encodeFunctionData('peek', [bytesToBytes32(baseId), bytesToBytes32(quoteId), WAD]),
    })

    proposal.push({
      target: compositeOracle.address,
      data: compositeOracle.interface.encodeFunctionData('setSource', [baseId, quoteId, oracle.address]),
    })
    console.log(`pair: ${bytesToString(baseId)}/${bytesToString(quoteId)} -> ${oracle.address}`)
  }

  return proposal
}

/**
 * @dev This script replaces one or more data sources in a CompositeMultiOracle.
 * These data sources are IOracle contracts that will be used either directly or as part of paths.
 */

import { getName } from '../../../shared/helpers'
import { ZERO_ADDRESS } from '../../../shared/constants'
import { CompositeMultiOracle, CompositeMultiOracle__factory } from '../../../typechain'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

export const updateCompositeSources = async (
  ownerAcc: SignerWithAddress,
  compositeOracle: CompositeMultiOracle,
  compositeSources: Array<[string, string, string]>,
  overrideExistent: boolean = true
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []

  const added = new Set<string>()

  for (let [baseId, quoteId, oracleAddress] of compositeSources) {
    const pair = `${getName(baseId)}/${getName(quoteId)}`

    if (added.has(pair) || added.has(`${getName(quoteId)}/${getName(baseId)}`)) {
      console.log(`CompositeMultiOracle: ${pair} already dealt with, skipping`)
      continue
    }
    added.add(pair)

    const oracle = CompositeMultiOracle__factory.connect(oracleAddress, ownerAcc)

    const existent = await oracle.sources(baseId, quoteId)
    if (existent === ZERO_ADDRESS || overrideExistent) {
      proposal.push({
        target: compositeOracle.address,
        data: compositeOracle.interface.encodeFunctionData('setSource', [baseId, quoteId, oracle.address]),
      })
      console.log(`CompositeMultiOracle: pair: ${pair} set to ${oracle.address}`)
    } else {
      console.log(`CompositeMultiOracle: pair: ${pair} already set to ${existent}`)
    }
  }

  return proposal
}

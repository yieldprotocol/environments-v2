import { RATE, CHI } from '../shared/constants'

import { CompoundMultiOracle } from '../typechain/CompoundMultiOracle'
import { ChainlinkMultiOracle } from '../typechain/ChainlinkMultiOracle'
import { CompositeMultiOracle } from '../typechain/CompositeMultiOracle'

export async function setupRateChi(
  compoundOracle: CompoundMultiOracle,
  rateSources: Map<string, string>,         // baseId => source
  chiSources: Map<string, string>         // baseId => source
) {

  for (let [baseId, rateSourceAddress] of rateSources) {
    await compoundOracle.setSource(baseId, RATE, rateSourceAddress)
    console.log(`[Rate: ${baseId},${RATE}: ${rateSourceAddress}],`)
  }

  for (let [baseId, chiSourceAddress] of chiSources) {
    await compoundOracle.setSource(baseId, CHI, chiSourceAddress)
    console.log(`[Chi: ${baseId},${CHI}: ${chiSourceAddress}],`)
  }
}
        

export async function setupSpot(
  spotOracle: ChainlinkMultiOracle,
  spotSources: Map<string, string>         // baseId,quoteId => source
) {

  for (let [pairId, spotSourceAddress] of spotSources) {
    const [baseId, quoteId] = pairId.split(',')
    await spotOracle.setSource(baseId, quoteId, spotSourceAddress)
    console.log(`[Spot: ${baseId},${quoteId}: ${spotSourceAddress}],`)
  }
}

export async function setupComposite(
    compositeOracle: CompositeMultiOracle,
    spotOracle: ChainlinkMultiOracle,
    compositePairs: Array<[string, string, number]>,
    compositePaths: Array<[string, string, Array<string>]> // DAI, USDC, [ETH]
  ) {

    for (let [baseId, quoteId,] of compositePairs) {
      // Set up the CompositeMultiOracle to draw from the ChainlinkMultiOracle
      await compositeOracle.setSource(baseId, quoteId, spotOracle.address)
      console.log(`[Composite: ${baseId},${quoteId}: ${spotOracle.address}],`)
    }

    for (let [baseId, quoteId, path] of compositePaths) {
      // Configure the base -> path1 -> path2 -> ilk path for base / ilk
      await compositeOracle.setPath(baseId, quoteId, path)
      console.log(`[Composite: ${baseId},${quoteId} through ${path}],`)
    }
}

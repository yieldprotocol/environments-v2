import *  as fs from 'fs'
import { jsonToMap } from '../shared/helpers'

import { ETH, DAI, USDC, WBTC } from '../shared/constants'
import { bytesToString, verify } from '../shared/helpers'
 
console.time("Mocks verified in");

(async () => {
    const assets = jsonToMap(fs.readFileSync('./output/assets.json', 'utf8')) as Map<string, string>;
    const chiSources = jsonToMap(fs.readFileSync('./output/chiSources.json', 'utf8')) as Map<string, string>;
    const rateSources = jsonToMap(fs.readFileSync('./output/rateSources.json', 'utf8')) as Map<string, string>;
    const spotSources = jsonToMap(fs.readFileSync('./output/spotSources.json', 'utf8')) as Map<string, string>;

    console.log(`Verifying tokens:`)
    for (let assetId of assets.keys()) {
      const symbol = bytesToString(assetId)
      const assetAddress = assets.get(assetId) as string
      console.log(`[${symbol}, '${assetAddress}'],`)

      let args: any
      if (assetId === DAI) args = [symbol, symbol]
      else if (assetId === USDC) args = []
      else if (assetId === ETH) args = []
      else if (assetId === WBTC) args = []
      else args = [symbol, symbol]
      verify(assetAddress, args)
    }

    console.log(`Verifying rate sources:`)
    for (let baseId of rateSources.keys()) {
      const args: any = []
      const rateAddress = rateSources.get(baseId) as string
      console.log(`[${baseId}, '${rateAddress}'],`)
      verify(rateAddress, args)
    }

    console.log(`Verifying chi sources:`)
    for (let baseId of chiSources.keys()) {
      const args: any = []
      const chiAddress = chiSources.get(baseId) as string
      console.log(`[${baseId}, '${chiAddress}'],`)
      verify(chiAddress, args)
    }

    console.log(`Verifying spot sources:`)
    for (let baseIlkId of spotSources.keys()) {
      const args: any = [18]
      const spotSourceAddress = spotSources.get(baseIlkId) as string
      console.log(`[${baseIlkId}, '${spotSourceAddress}'],`)
      verify(spotSourceAddress, args)
    }

    console.timeEnd("Mocks verified in")
})()
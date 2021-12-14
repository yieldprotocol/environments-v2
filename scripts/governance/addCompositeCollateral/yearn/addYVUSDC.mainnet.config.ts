import { BigNumber } from 'ethers'
import { readAddressMappingIfExists } from '../../../../shared/helpers'
import { ETH, DAI, USDC, WBTC, WSTETH, STETH, LINK, ENS, YVUSDC } from '../../../../shared/constants'
import { CHAINLINK, COMPOSITE, YEARN } from '../../../../shared/constants'
import { FYDAI2112, FYDAI2203, FYUSDC2112, FYUSDC2203, FYETH2203, FYETH2206 } from '../../../../shared/constants'

const protocol = readAddressMappingIfExists('protocol.json');

export const developer = '0xE7aa7AF667016837733F3CA3809bdE04697730eF'
export const deployer = '0xE7aa7AF667016837733F3CA3809bdE04697730eF'

export const assets: Map<string, string> = new Map([
  [ETH,    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'],
  [DAI,    '0x6B175474E89094C44Da98b954EedeAC495271d0F'],
  [USDC,   '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'],
  [YVUSDC, '0x5f18c75abdae578b483e5f43f12a39cf75b973a9'],
])

// underlying, yvToken, address
export const yearnSources: Array<[string, string, string]> = [
  [USDC, YVUSDC,  assets.get(YVUSDC) as string]
]

export const compositeSources: Array<[string, string, string]> = [
  [USDC, YVUSDC, protocol.get(YEARN) as string],
  [DAI, USDC, protocol.get(CHAINLINK) as string],
  [ETH, USDC, protocol.get(CHAINLINK) as string],
]

export const compositePaths: Array<[string, string, Array<string>]> = [
  [DAI, YVUSDC, [USDC]],
  [ETH, YVUSDC, [USDC]],
]

// Assets for which we will have a Join
export const assetsToAdd: Array<[string, string]> = [
  [YVUSDC, assets.get(YVUSDC) as string],
]

// Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), inv(ratio), line, dust, dec
export const compositeLimits: Array<[string, string, string, number, number, number, number, number]> = [
  [DAI,  YVUSDC, COMPOSITE, 1400000, 714000, 500000,  5000,    18],
  [USDC, YVUSDC, COMPOSITE, 1400000, 714000, 500000,  5000,    6],
  [ETH,  YVUSDC, COMPOSITE, 1670000, 600000, 2500000, 1000000, 12],
]

// Input data: seriesId, [ilkIds]
export const seriesIlks: Array<[string, string[]]> = [
  [FYDAI2112,  [YVUSDC]],
  [FYDAI2203,  [YVUSDC]],
  [FYUSDC2112, [YVUSDC]],
  [FYUSDC2203, [YVUSDC]],
  [FYETH2203,  [YVUSDC]],
  [FYETH2206,  [YVUSDC]]
]

import { BigNumber } from 'ethers'
import { readAddressMappingIfExists } from '../../../../shared/helpers'
import { ETH, DAI, USDC, WBTC, WSTETH, STETH, LINK, ENS, YVUSDC } from '../../../../shared/constants'
import { CHAINLINK, COMPOSITE, YEARN } from '../../../../shared/constants'
import { FYDAI2112, FYDAI2203, FYUSDC2112, FYUSDC2203, FYETH2203, FYETH2206 } from '../../../../shared/constants'

const protocol = readAddressMappingIfExists('protocol.json');

export const developer = '0x09F41c916B5C2e26706fEbf7c4666d2afE57419A'
export const deployer = '0x09F41c916B5C2e26706fEbf7c4666d2afE57419A'

export const assets: Map<string, string> = new Map([
  [ETH,    '0x67c5279f044A40746017Ae1edD8bb7573273aA8b'],
  [DAI,    '0x32E85Fa11a53ac73067881ef7E56d47a3BCe3e2C'],
  [USDC,   '0xf4aDD9708888e654C042613843f413A8d6aDB8Fe'],
  [WBTC,   '0x69A11AA0D394337570d84ce824a1ca6aFA0765DF'],
  [WSTETH, '0xf9F4D9e05503D416E95f05831A95ff43c3A01182'],
  [STETH,  '0xE910c4D4802898683De478e57852738e773dBCD9'],
  [LINK,   '0xfdf099372cded51a9dA9c0431707789f08B06C70'],
  [ENS,    '0x5BeAdC789F094741DEaacd5a1499aEd7E9d7FB78'],
  [YVUSDC, '0x2381d065e83DDdBaCD9B4955d49D5a858AE5957B'],
])

// underlying, yvToken, address
export const yearnSources: Array<[string, string, string]> = [
  [USDC, YVUSDC,  assets.get(YVUSDC) as string]
]

export const compositeSources: Array<[string, string, string]> = [
  [USDC, YVUSDC, protocol.get(YEARN) as string],
  [DAI, USDC, protocol.get(CHAINLINK) as string], // Maybe it's there already?
  [ETH, USDC, protocol.get(CHAINLINK) as string], // Maybe it's there already?
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

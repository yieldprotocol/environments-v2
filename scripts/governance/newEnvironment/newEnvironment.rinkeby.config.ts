import { BigNumber } from 'ethers'
import { readAddressMappingIfExists } from '../../../shared/helpers'
import { ETH, DAI, USDC, WBTC, WSTETH, STETH, LINK, ENS, UNI, YVUSDC } from '../../../shared/constants'
import { CHAINLINK, COMPOSITE, LIDO, UNISWAP, YEARN } from '../../../shared/constants'
import { FYDAI2112, FYDAI2203, FYUSDC2112, FYUSDC2203, EODEC21, EOMAR22 } from '../../../shared/constants'
import { YSDAI6MMS,YSDAI6MJD, YSUSDC6MMS, YSUSDC6MJD, WAD, ONEUSDC } from '../../../shared/constants'

const protocol = readAddressMappingIfExists('protocol.json');

export const chainId = 4
export const developer = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
export const deployer = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'

export const additionalDevelopers: Array<string> = []
export const additionalGovernors: Array<string> = [
  '0x7ffB5DeB7eb13020aa848bED9DE9222E8F42Fd9A',
  '0xE7aa7AF667016837733F3CA3809bdE04697730eF'
]

export const assets: Map<string, string> = new Map([
  [ETH,    '0x67c5279f044A40746017Ae1edD8bb7573273aA8b'],
  [DAI,    '0x32E85Fa11a53ac73067881ef7E56d47a3BCe3e2C'],
  [USDC,   '0xf4aDD9708888e654C042613843f413A8d6aDB8Fe'],
  [WBTC,   '0x69A11AA0D394337570d84ce824a1ca6aFA0765DF'],
  [WSTETH, '0xf9F4D9e05503D416E95f05831A95ff43c3A01182'],
  [STETH,  '0xE910c4D4802898683De478e57852738e773dBCD9'],
  [LINK,   '0xfdf099372cded51a9dA9c0431707789f08B06C70'],
  [ENS,    '0x5BeAdC789F094741DEaacd5a1499aEd7E9d7FB78'],
  [UNI,    '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'],
  [YVUSDC, '0x2381d065e83DDdBaCD9B4955d49D5a858AE5957B'],
])

export const chiSources: Array<[string, string]> = [
  [DAI,  '0x6d7f0754ffeb405d23c51ce938289d4835be3b14'],
  [USDC, '0x5b281a6dda0b271e91ae35de655ad301c976edb1'],
]

export const rateSources: Array<[string, string]> = [
  [DAI,  '0x6d7f0754ffeb405d23c51ce938289d4835be3b14'],
  [USDC, '0x5b281a6dda0b271e91ae35de655ad301c976edb1'],
]

export const chainlinkSources: Array<[string, string, string, string, string]> = [
  [DAI,   assets.get(DAI)   as string, ETH, assets.get(ETH) as string, '0x74825DbC8BF76CC4e9494d0ecB210f676Efa001D'],
  [USDC,  assets.get(USDC)  as string, ETH, assets.get(ETH) as string, '0xdCA36F27cbC4E38aE16C4E9f99D39b42337F6dcf'],
  [WBTC,  assets.get(WBTC)  as string, ETH, assets.get(ETH) as string, '0x2431452A0010a43878bF198e170F6319Af6d27F4'],
  [STETH, assets.get(STETH) as string, ETH, assets.get(ETH) as string, '0x17AEAA7aF619Cf60095528cB115fbE22F14dFA44'],
  [LINK,  assets.get(LINK)  as string, ETH, assets.get(ETH) as string, '0xFABe80711F3ea886C3AC102c81ffC9825E16162E'],
  [ENS,   assets.get(ENS)   as string, ETH, assets.get(ETH) as string, '0x64EB137E967D1788Ce653C4Bdd4E4aD708F50Ae6'],
  [UNI,   assets.get(UNI)   as string, ETH, assets.get(ETH) as string, '0x5E4FaE1eCCAc5a120e48cC02012aF1aeFF94dACc'],
]

// token0, token1, address, twapInterval
export const uniswapSources: Array<[string, string, string, number]> = [] // We don't use uniswap v2 in Rinkeby

// The lidoSource is the wstETH contract
export const lidoSource = assets.get(WSTETH) as string

// underlying, yvToken, address
export const yearnSources: Array<[string, string, string]> = [
  [USDC, YVUSDC,  assets.get(YVUSDC) as string]
]

export const compositeSources: Array<[string, string, string]> = [
  [DAI,    ETH,   protocol.get(CHAINLINK) as string],
  [USDC,   ETH,   protocol.get(CHAINLINK) as string],
  [WBTC,   ETH,   protocol.get(CHAINLINK) as string],
  [STETH,  ETH,   protocol.get(CHAINLINK) as string],
  [WSTETH, STETH, protocol.get(LIDO)      as string],
  [ENS,    ETH,   protocol.get(CHAINLINK) as string], // We don't use Uniswap on rinkeby
]

export const compositePaths: Array<[string, string, Array<string>]> = [
  [WSTETH, DAI, [STETH, ETH]],
  [WSTETH, USDC, [STETH, ETH]],
  [ENS, DAI, [ETH]],
  [ENS, USDC, [ETH]],
]

// Assets for which we will have a Join
export const assetsToAdd: Array<[string, string]> = [
  [ETH,    assets.get(ETH)    as string],
  [DAI,    assets.get(DAI)    as string],
  [USDC,   assets.get(USDC)   as string],
  [WBTC,   assets.get(WBTC)   as string],
  [WSTETH, assets.get(WSTETH) as string],
  [LINK,   assets.get(LINK)   as string],
  [ENS,    assets.get(ENS)    as string],
  [UNI,    assets.get(UNI)    as string],
  [YVUSDC, assets.get(YVUSDC) as string],
]

// Assets for which we will have an Oracle, but not a Join
export const assetsToReserve: Array<[string, string]> = [
  [STETH, assets.get(STETH) as string]
]

export const bases: Array<string> = [DAI, USDC]

// Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), inv(ratio), line, dust, dec
export const chainlinkLimits: Array<[string, string, string, number, number, number, number, number]> = [
  [DAI,  ETH,  CHAINLINK, 1400000, 714000,  2000000,  5000, 18],
  [DAI,  DAI,  CHAINLINK, 1000000, 1000000, 10000000, 0,    18], // Constant 1, no dust
  [DAI,  USDC, CHAINLINK, 1330000, 751000,  100000,   5000, 18], // Via ETH
  [DAI,  WBTC, CHAINLINK, 1500000, 666000,  100000,   5000, 18], // Via ETH
  [DAI,  LINK, CHAINLINK, 1670000, 600000,  1000000,  5000, 18],
  [DAI,  UNI,  CHAINLINK, 1670000, 600000,  1000000,  5000, 18],
  [USDC, ETH,  CHAINLINK, 1400000, 714000,  5000000,  5000, 6],
  [USDC, DAI,  CHAINLINK, 1330000, 751000,  100000,   5000, 6], // Via ETH
  [USDC, USDC, CHAINLINK, 1000000, 1000000, 10000000, 0,    6], // Constant 1, no dust
  [USDC, WBTC, CHAINLINK, 1500000, 666000,  100000,   5000, 6], // Via ETH  
  [USDC, LINK, CHAINLINK, 1670000, 600000,  1000000,  5000, 6],
  [USDC, UNI,  CHAINLINK, 1670000, 600000,  1000000,  5000, 6],
]

// Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), inv(ratio), line, dust, dec
export const compositeLimits: Array<[string, string, string, number, number, number, number, number]> = [
  [DAI,  WSTETH, COMPOSITE, 1400000, 714000, 500000,  5000, 18],
  [USDC, WSTETH, COMPOSITE, 1400000, 714000, 500000,  5000, 6],
  [DAI,  ENS,    COMPOSITE, 1670000, 600000, 2000000, 5000, 18],
  [USDC, ENS,    COMPOSITE, 1670000, 600000, 2000000, 5000, 6],
]

// Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), inv(ratio), line, dust, dec
export const yearnLimits: Array<[string, string, string, number, number, number, number, number]> = [
  [USDC, YVUSDC, YEARN,     1250000, 800000, 1000000,   5000, 6],
]

// Input data: seriesId, baseId, maturity, [ilkIds], symbol, name
export const seriesDAI: Array<[string, string, number, string[], string, string]> = [
  [FYDAI2112,  DAI,  EODEC21, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI], 'FYDAI2112',  'FYDAI2112'],
  [FYDAI2203,  DAI,  EOMAR22, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI], 'FYDAI2203',  'FYDAI2203'],
]

// Input data: seriesId, baseId, maturity, [ilkIds], symbol, name
export const seriesUSDC: Array<[string, string, number, string[], string, string]> = [
  [FYUSDC2112, USDC, EODEC21, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI, YVUSDC], 'FYUSDC2112', 'FYUSDC2112'],
  [FYUSDC2203, USDC, EOMAR22, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI, YVUSDC], 'FYUSDC2203', 'FYUSDC2203'],
]

export const strategiesData: Array<[string, string, string]> = [
  // name, symbol, baseId
  ['Yield Strategy DAI 6M Mar Sep',  YSDAI6MMS,  DAI],
  ['Yield Strategy DAI 6M Jun Dec',  YSDAI6MJD,  DAI],
  ['Yield Strategy USDC 6M Mar Sep', YSUSDC6MMS, USDC],
  ['Yield Strategy USDC 6M Jun Dec', YSUSDC6MJD, USDC],
]

// Input data
export const strategiesInit: Array<[string, string, BigNumber]> = [
  // [strategyId, startPoolId, initAmount]
  [YSDAI6MMS,  FYDAI2203,  WAD.mul(100)],
  [YSDAI6MJD,  FYDAI2112,  WAD.mul(100)],
  [YSUSDC6MMS, FYUSDC2203, ONEUSDC.mul(100)],
  [YSUSDC6MJD, FYUSDC2112, ONEUSDC.mul(100)],
]

export const poolsInit: Array<[string, BigNumber]> = [
  // poolId, initAmount
  [FYDAI2203,  WAD.mul(100)],
  [FYDAI2112,  WAD.mul(100)],
  [FYUSDC2203, ONEUSDC.mul(100)],
  [FYUSDC2112, ONEUSDC.mul(100)],
]

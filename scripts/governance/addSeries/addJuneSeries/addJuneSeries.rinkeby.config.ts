import { BigNumber } from 'ethers'
import { readAddressMappingIfExists } from '../../../../shared/helpers'
import { ETH, DAI, USDC, WBTC, WSTETH, STETH, LINK, ENS, UNI, WAD, ONEUSDC, MAX256 } from '../../../../shared/constants'
import { EOJUN22, FYDAI2206, FYUSDC2206, YSDAI6MJD, YSUSDC6MJD, COMPOUND } from '../../../../shared/constants'

const protocol = readAddressMappingIfExists('protocol.json');

// When deploying the pools, the fyToken should be present already
const fyTokens = readAddressMappingIfExists('newFYTokens.json');

export const developer = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
export const deployer = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
export const whale = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'

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
])

// assetId, joinAddress
export const joins: Map<string, string> = new Map([
  [DAI,    '0x96cc8be616fEec55F58A1E647b45c2989AEB4096'],
  [USDC,   '0x56727B9892042Ae397D319FDebCA7fb47780d525'],
])

// seriesId, fyTokenAddress
export const poolData: Array<[string, string]> = [
  [FYDAI2206,  fyTokens.get(FYDAI2206) as string],
  [FYUSDC2206, fyTokens.get(FYUSDC2206) as string]
]

// seriesId, initAmount
export const poolsInit: Array<[string, BigNumber, BigNumber]> = [
  [FYDAI2206,  WAD.mul(100),  WAD.mul(32)],
  [FYUSDC2206, ONEUSDC.mul(100), ONEUSDC.mul(48)],
]

// assetId, loanAmount
export const joinLoans: Array<[string, BigNumber]> = [
  [DAI,  WAD.mul(100)],
  [USDC, ONEUSDC.mul(100)],
]
  

// seriesId, underlyingId, chiOracleAddress, joinAddress, maturity, name, symbol
export const fyTokenData: Array<[string, string, string, string, number, string, string]> = [
  [FYDAI2206,  DAI,  protocol.get(COMPOUND) as string, joins.get(DAI) as string,  EOJUN22, 'FYDAI2206',  'FYDAI2206'],
  [FYUSDC2206, USDC, protocol.get(COMPOUND) as string, joins.get(USDC) as string, EOJUN22, 'FYUSDC2206', 'FYUSDC2206'],
]

// seriesId, accepted ilks
export const seriesIlks: Array<[string, string[]]> = [
  [FYDAI2206,  [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI]],
  [FYUSDC2206, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI]],
]

// strategyId, nextSeriesId, minRatio, maxRatio
export const rollData: Array<[string, string, BigNumber, BigNumber]> = [
  [YSDAI6MJD,  FYDAI2206,  BigNumber.from(0), MAX256],
  [YSUSDC6MJD, FYUSDC2206, BigNumber.from(0), MAX256],
]



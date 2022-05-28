import { BigNumber } from 'ethers'
import { readAddressMappingIfExists } from '../../../../shared/helpers'
import {
  ETH,
  DAI,
  USDC,
  WBTC,
  WSTETH,
  STETH,
  LINK,
  ENS,
  UNI,
  YVUSDC,
  WAD,
  ONEUSDC,
  MAX256,
  ONE64,
  secondsIn25Years,
} from '../../../../shared/constants'
import { EOSEP22, FYDAI2209, FYUSDC2209, YSDAI6MMS, YSUSDC6MMS, COMPOUND } from '../../../../shared/constants'

const protocol = readAddressMappingIfExists('protocol.json')

// When deploying the pools, the fyToken should be present already
const fyTokens = readAddressMappingIfExists('newFYTokens.json')

export const developer = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
export const deployer = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
export const whales: Map<string, string> = new Map([
  [ETH, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  [DAI, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  [USDC, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
])

export const assets: Map<string, string> = new Map([
  [ETH, '0x67c5279f044A40746017Ae1edD8bb7573273aA8b'],
  [DAI, '0x32E85Fa11a53ac73067881ef7E56d47a3BCe3e2C'],
  [USDC, '0xf4aDD9708888e654C042613843f413A8d6aDB8Fe'],
  [WBTC, '0x69A11AA0D394337570d84ce824a1ca6aFA0765DF'],
  [WSTETH, '0xf9F4D9e05503D416E95f05831A95ff43c3A01182'],
  [STETH, '0xE910c4D4802898683De478e57852738e773dBCD9'],
  [LINK, '0xfdf099372cded51a9dA9c0431707789f08B06C70'],
  [ENS, '0x5BeAdC789F094741DEaacd5a1499aEd7E9d7FB78'],
  [UNI, '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'],
])

// assetId, joinAddress
export const joins: Map<string, string> = new Map([
  [DAI, '0xbd9b36A87f8da13fb88bB2Fd02fe247e9f641D20'],
  [USDC, '0x015041d4C46aa908850cf897e237592f2B1aa699'],
])

// seriesId, underlyingId, chiOracleAddress, joinAddress, maturity, name, symbol
export const fyTokenData: Array<[string, string, string, string, number, string, string]> = [
  [FYDAI2209, DAI, protocol.get(COMPOUND) as string, joins.get(DAI) as string, EOSEP22, 'FYDAI2209', 'FYDAI2209'],
  [FYUSDC2209, USDC, protocol.get(COMPOUND) as string, joins.get(USDC) as string, EOSEP22, 'FYUSDC2209', 'FYUSDC2209'],
]

// Parameters to deploy pools with, a pool being identified by the related seriesId
// seriesId, baseAddress, fyTokenAddress, ts (time stretch), g1 (Sell base to the pool fee), g2 (Sell fyToken to the pool fee)
export const poolData: Array<[string, string, string, BigNumber, BigNumber, BigNumber]> = [
  [
    FYDAI2209,
    assets.get(DAI) as string,
    fyTokens.get(FYDAI2209) as string,
    ONE64.div(secondsIn25Years),
    ONE64.mul(75).div(100),
    ONE64.mul(100).div(75),
  ],
  [
    FYUSDC2209,
    assets.get(USDC) as string,
    fyTokens.get(FYUSDC2209) as string,
    ONE64.div(secondsIn25Years),
    ONE64.mul(75).div(100),
    ONE64.mul(100).div(75),
  ],
]

// Amounts to initialize pools with, a pool being identified by the related seriesId
// seriesId, initAmount
export const poolsInit: Array<[string, string, BigNumber, BigNumber]> = [
  [FYDAI2209, DAI, WAD.mul(100), BigNumber.from('0')],
  [FYUSDC2209, USDC, ONEUSDC.mul(100), BigNumber.from('0')],
]

// Pool fees to be set in the PoolFactory prior to pool deployment
// g1, g2
export const poolFees: [BigNumber, BigNumber] = [
  ONE64.mul(75).div(100), // Sell base to the pool
  ONE64.mul(100).div(75), // Sell fyToken to the pool
]

// Time stretch to be set in the PoolFactory prior to pool deployment
export const timeStretch: BigNumber = ONE64.div(secondsIn25Years)

// Amount to loan to the Joins in forks. On mainnet, someone will need to deposit into a vault
// assetId, loanAmount
// export const joinLoans: Array<[string, BigNumber]> = [
//   [DAI, WAD.mul(10000)], // Join(0x4fE92119CDf873Cf8826F4E6EcfD4E578E3D44Dc) has 751342576505567524055158 DAI, pool(0x2e4B70D0F020E62885E82bf75bc123e1Aa8c79cA) has 28060258605059358888379 fyDAI. Surplus is 723282317900508165166779 DAI
//   [USDC, ONEUSDC.mul(10000)], // Join(0x0d9A1A773be5a83eEbda23bf98efB8585C3ae4f4) has 2627478782835 USDC, pool(0x80142add3A597b1eD1DE392A56B2cef3d8302797) has 86578888882 fyUSDC. Surplus is 2540899893953 USDC.
// ]

// Ilks to accept for each series
// seriesId, accepted ilks
export const seriesIlks: Array<[string, string[]]> = [
  [FYDAI2209, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI]],
  [FYUSDC2209, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI, YVUSDC]],
]

// Parameters to roll each strategy
// strategyId, nextSeriesId, minRatio, maxRatio
export const rollData: Array<[string, string, BigNumber, BigNumber]> = [
  [YSDAI6MMS, FYDAI2209, BigNumber.from(0), MAX256],
  [YSUSDC6MMS, FYUSDC2209, BigNumber.from(0), MAX256],
]

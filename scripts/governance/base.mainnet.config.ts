import { readAddressMappingIfExists } from '../../shared/helpers'
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
  YVDAI,
  YVUSDC,
  FRAX,
  EWETH,
  EDAI,
  EUSDC,
  YSDAI6MMS,
  YSDAI6MMSASSET,
  YSDAI6MJDASSET,
  YSETH6MJDASSET,
  YSETH6MMSASSET,
  YSFRAX6MJDASSET,
  YSFRAX6MMSASSET,
  YSUSDC6MJDASSET,
  YSUSDC6MMSASSET,
  EFRAX,
} from '../../shared/constants'
import { CHAINLINK, COMPOSITE, LIDO, UNISWAP, COMPOUND, YEARN } from '../../shared/constants'
import { FCASH_MAR22, FCASH_JUN22, FCASH_SEP22, FCASH_DEC22, FCASH_MAR23 } from '../../shared/constants'
import { FYETH2203, FYETH2206, FYETH2209, FYETH2212, FYETH2303 } from '../../shared/constants'
import { FYDAI2203, FYDAI2206, FYDAI2209, FYDAI2212, FYDAI2303 } from '../../shared/constants'
import { FYUSDC2203, FYUSDC2206, FYUSDC2209, FYUSDC2212, FYUSDC2303 } from '../../shared/constants'
import { FYFRAX2206, FYFRAX2209, FYFRAX2212, FYFRAX2303 } from '../../shared/constants'

import { FETH2212, FETH2303 } from '../../shared/constants'
import { FDAI2203, FDAI2206, FDAI2209, FDAI2212, FDAI2303 } from '../../shared/constants'
import { FUSDC2203, FUSDC2206, FUSDC2209, FUSDC2212, FUSDC2303 } from '../../shared/constants'

import { ethers } from 'ethers'

export const external = readAddressMappingIfExists('external.json')
export const protocol = readAddressMappingIfExists('protocol.json')
export const governance = readAddressMappingIfExists('governance.json')
export const fyTokens = readAddressMappingIfExists('fyTokens.json')
export const pools = readAddressMappingIfExists('pools.json')
export const strategies = readAddressMappingIfExists('strategies.json')
export const assets = readAddressMappingIfExists('assets.json')
export const joins = readAddressMappingIfExists('joins.json')
export const newJoins = readAddressMappingIfExists('newJoins.json')
export const newFYTokens = readAddressMappingIfExists('newFYTokens.json')
export const newPools = readAddressMappingIfExists('newPools.json')
export const newStrategies = readAddressMappingIfExists('newStrategies.json')

export const chainId = 1

export const developer = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const whales: Map<string, string> = new Map([
  [ETH, '0xd51a44d3fae010294c616388b506acda1bfaae46'],
  [DAI, '0x16b34ce9a6a6f7fc2dd25ba59bf7308e7b38e186'],
  [USDC, '0xcffad3200574698b78f32232aa9d63eabd290703'],
  [WBTC, '0xd51a44d3fae010294c616388b506acda1bfaae46'],
  [WSTETH, '0x10cd5fbe1b404b7e19ef964b63939907bdaf42e2'],
  [STETH, '0x1982b2f5814301d4e9a8b0201555376e62f82428'],
  [LINK, '0x0d4f1ff895d12c34994d6b65fabbeefdc1a9fb39'],
  [ENS, '0xd7a029db2585553978190db5e85ec724aa4df23f'],
  [YVUSDC, '0x5934807cc0654d46755ebd2848840b616256c6ef'],
  [YVDAI, '0x50da1e9c57c334bb3a7bc10ddb6860331ec3c62a'],
  [UNI, '0x47173b170c64d16393a52e6c480b3ad8c302ba1e'],
  [FRAX, '0xc63b0708e2f7e69cb8a1df0e1389a98c35a76d52'],
  [YSDAI6MMSASSET, '0x232c412d3613d5915fc1ebf6eb8d14f11b6a260d'],
  [YSDAI6MJDASSET, '0x9185df15078547055604f5c0b02fc1c8d93594a5'],
  [YSUSDC6MMSASSET, '0x3250e201c2eb06d086138f181e0fb6d1fe33f7d1'],
  [YSUSDC6MJDASSET, '0x64d226daf361f4f2cc5ad48b7501a7ea2598859f'],
  [YSETH6MMSASSET, '0xbe6cce2753c0e99bc9e1b1bea946d35921aabd49'],
  [YSETH6MJDASSET, '0x3336581a28870d343e085beae4cec23f47838899'],
  [YSFRAX6MMSASSET, '0x430e076e5292e0028a0a17a00a65c43e6ee7fb91'],
  [YSFRAX6MJDASSET, '0x3b870db67a45611cf4723d44487eaf398fac51e3'],
])

export const chiSources: Array<[string, string]> = [
  [DAI, '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643'],
  [USDC, '0x39aa39c021dfbae8fac545936693ac917d5e7563'],
]

export const rateSources: Array<[string, string]> = [
  [DAI, '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643'],
  [USDC, '0x39aa39c021dfbae8fac545936693ac917d5e7563'],
]

export const chainlinkSources: Array<[string, string, string, string, string]> = [
  [DAI, assets.get(DAI) as string, ETH, assets.get(ETH) as string, '0x773616E4d11A78F511299002da57A0a94577F1f4'],
  [USDC, assets.get(USDC) as string, ETH, assets.get(ETH) as string, '0x986b5E1e1755e3C2440e960477f25201B0a8bbD4'],
  [WBTC, assets.get(WBTC) as string, ETH, assets.get(ETH) as string, '0xdeb288F737066589598e9214E782fa5A8eD689e8'],
  [STETH, assets.get(STETH) as string, ETH, assets.get(ETH) as string, '0x86392dC19c0b719886221c78AB11eb8Cf5c52812'],
  [LINK, assets.get(LINK) as string, ETH, assets.get(ETH) as string, '0xDC530D9457755926550b59e8ECcdaE7624181557'],
  [UNI, assets.get(UNI) as string, ETH, assets.get(ETH) as string, '0xD6aA3D25116d8dA79Ea0246c4826EB951872e02e'],
]

// token0, token1, address, twapInterval
export const uniswapSources: Array<[string, string, string, number]> = [] // We don't use uniswap v2 in Rinkeby

// The lidoSource is the wstETH contract
export const lidoSource = assets.get(WSTETH) as string

// underlying, yvToken, address
export const yearnSources: Array<[string, string, string]> = [[USDC, YVUSDC, assets.get(YVUSDC) as string]]

export const compositeSources: Array<[string, string, string]> = [
  [DAI, ETH, protocol.get(CHAINLINK) as string],
  [USDC, ETH, protocol.get(CHAINLINK) as string],
  [WBTC, ETH, protocol.get(CHAINLINK) as string],
  [STETH, ETH, protocol.get(CHAINLINK) as string],
  [WSTETH, STETH, protocol.get(LIDO) as string],
  [ENS, ETH, protocol.get(CHAINLINK) as string], // We don't use Uniswap on rinkeby
]

export const compositePaths: Array<[string, string, Array<string>]> = [
  [WSTETH, DAI, [STETH, ETH]],
  [WSTETH, USDC, [STETH, ETH]],
  [ENS, DAI, [ETH]],
  [ENS, USDC, [ETH]],
]

// Assets for which we will have a Join
export const assetsToAdd: Array<[string, string]> = [
  [ETH, assets.get(ETH) as string],
  [DAI, assets.get(DAI) as string],
  [USDC, assets.get(USDC) as string],
  [WBTC, assets.get(WBTC) as string],
  [WSTETH, assets.get(WSTETH) as string],
  [LINK, assets.get(LINK) as string],
  [ENS, assets.get(ENS) as string],
  [UNI, assets.get(UNI) as string],
  [YVUSDC, assets.get(YVUSDC) as string],
]

// Assets for which we will have an Oracle, but not a Join
export const assetsToReserve: Array<[string, string]> = [[STETH, assets.get(STETH) as string]]

// Assets that will be made into a base
export const bases: Array<[string, string]> = [
  [DAI, joins.get(DAI) as string],
  [USDC, joins.get(USDC) as string],
]

// Input data: baseId, ilkId, ratio (1000000 == 100%), line, dust, dec
export const chainlinkDebtLimits: Array<[string, string, number, number, number, number]> = [
  [DAI, ETH, 1400000, 2000000, 5000, 18],
  [DAI, DAI, 1000000, 10000000, 0, 18], // Constant 1, no dust
  [DAI, USDC, 1330000, 100000, 5000, 18], // Via ETH
  [DAI, WBTC, 1500000, 100000, 5000, 18], // Via ETH
  [DAI, LINK, 1670000, 1000000, 5000, 18],
  [DAI, UNI, 1670000, 1000000, 5000, 18],
  [USDC, ETH, 1400000, 5000000, 5000, 6],
  [USDC, DAI, 1330000, 100000, 5000, 6], // Via ETH
  [USDC, USDC, 1000000, 10000000, 0, 6], // Constant 1, no dust
  [USDC, WBTC, 1500000, 100000, 5000, 6], // Via ETH
  [USDC, LINK, 1670000, 1000000, 5000, 6],
  [USDC, UNI, 1670000, 1000000, 5000, 6],
]

// Input data: baseId, ilkId, ratio (1000000 == 100%), line, dust, dec
export const compositeDebtLimits: Array<[string, string, number, number, number, number]> = [
  [DAI, WSTETH, 1400000, 500000, 5000, 18],
  [USDC, WSTETH, 1400000, 500000, 5000, 6],
  [DAI, ENS, 1670000, 2000000, 5000, 18],
  [USDC, ENS, 1670000, 2000000, 5000, 6],
]

// Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), line, dust, dec
export const yearnDebtLimits: Array<[string, string, number, number, number, number]> = [
  [USDC, YVUSDC, 1250000, 1000000, 5000, 6],
]

// Input data: ilkId, duration, initialOffer, auctionLine, auctionDust, dec
export const chainlinkAuctionLimits: Array<[string, number, number, number, number, number]> = [
  [ETH, 3600, 714000, 3250000000, 1500000, 12],
  [DAI, 3600, 751000, 10000000, 5000, 18],
  [USDC, 3600, 751000, 10000000, 5000, 6],
  [WBTC, 3600, 666000, 2500000, 1200, 4],
  [LINK, 3600, 600000, 600000, 300, 18],
  [UNI, 3600, 600000, 1000000, 400, 18],
]

// Input data: ilkId, duration, initialOffer, auctionLine, auctionDust, dec
export const compositeAuctionLimits: Array<[string, number, number, number, number, number]> = [
  [WSTETH, 3600, 714000, 3250000000, 1500000, 12],
  [ENS, 3600, 600000, 500000, 250, 18],
]

// Input data: ilkId, duration, initialOffer, auctionLine, auctionDust, ilkDec
export const yearnAuctionLimits: Array<[string, number, number, number, number, number]> = [
  [YVUSDC, 3600, 800000, 10000000, 5000, 6],
]

// baseId, accepted ilks
export const ilks: Map<string, string[]> = new Map([
  [DAI, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI]],
  [USDC, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, YVUSDC, UNI]],
  [ETH, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI]],
  [FRAX, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI]],
])

// baseId, maturity, fCashAssetId
export const fCashAssets: Map<string, Map<number, string>> = new Map([
  [
    DAI,
    new Map([
      [FCASH_MAR22, FYDAI2203],
      [FCASH_JUN22, FYDAI2206],
      [FCASH_SEP22, FYDAI2209],
      [FCASH_DEC22, FYDAI2212],
      [FCASH_MAR23, FYDAI2303],
    ]),
  ],
  [
    USDC,
    new Map([
      [FCASH_MAR22, FYUSDC2203],
      [FCASH_JUN22, FYUSDC2206],
      [FCASH_SEP22, FYUSDC2209],
      [FCASH_DEC22, FYUSDC2212],
      [FCASH_MAR23, FYUSDC2303],
    ]),
  ],
  [
    ETH,
    new Map([
      [FCASH_MAR22, FYETH2203],
      [FCASH_JUN22, FYETH2206],
      [FCASH_SEP22, FYETH2209],
      [FCASH_DEC22, FYETH2212],
      [FCASH_MAR23, FYETH2303],
    ]),
  ],
  [FRAX, new Map()],
])

// seriesId, accepted ilks
export const seriesIlks: Array<[string, string[]]> = [
  [FYDAI2203, ilks.get(DAI)!.concat([assets.get(FDAI2203)!])],
  [FYDAI2206, ilks.get(DAI)!.concat([assets.get(FDAI2206)!])],
  [FYDAI2209, ilks.get(DAI)!.concat([assets.get(FDAI2209)!])],
  [FYDAI2212, ilks.get(DAI)!.concat([assets.get(FDAI2212)!])],
  [FYDAI2303, ilks.get(DAI)!.concat([assets.get(FDAI2303)!])],

  [FYUSDC2203, ilks.get(USDC)!.concat([assets.get(FUSDC2203)!])],
  [FYUSDC2206, ilks.get(USDC)!.concat([assets.get(FUSDC2206)!])],
  [FYUSDC2209, ilks.get(USDC)!.concat([assets.get(FUSDC2209)!])],
  [FYUSDC2212, ilks.get(USDC)!.concat([assets.get(FUSDC2212)!])],
  [FYUSDC2303, ilks.get(USDC)!.concat([assets.get(FUSDC2303)!])],

  [FYETH2203, ilks.get(ETH)!],
  [FYETH2206, ilks.get(ETH)!],
  [FYETH2209, ilks.get(ETH)!],
  [FYETH2212, ilks.get(ETH)!.concat([assets.get(FETH2212)!])],
  [FYETH2303, ilks.get(ETH)!.concat([assets.get(FETH2303)!])],

  [FYFRAX2206, ilks.get(FRAX)!],
  [FYFRAX2209, ilks.get(FRAX)!],
  [FYFRAX2212, ilks.get(FRAX)!],
  [FYFRAX2303, ilks.get(FRAX)!],
]

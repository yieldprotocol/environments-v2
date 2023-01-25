import { readAddressMappingIfExists } from '../../shared/helpers'
import {
  DAI,
  ENS,
  ETH,
  FRAX,
  LINK,
  STETH,
  UNI,
  USDC,
  WBTC,
  WSTETH,
  YSDAI6MJDASSET,
  YSDAI6MMSASSET,
  YSETH6MJDASSET,
  YSETH6MMSASSET,
  YSFRAX6MJDASSET,
  YSFRAX6MMSASSET,
  YSUSDC6MJDASSET,
  YSUSDC6MMSASSET,
  CRAB,
  YVDAI,
  YVUSDC,
  USDT,
  RETH,
  ZENBULL,
} from '../../shared/constants'

export const external = readAddressMappingIfExists('external.json')
export const assets = readAddressMappingIfExists('assets.json')
export const protocol = readAddressMappingIfExists('protocol.json')
export const governance = readAddressMappingIfExists('governance.json')
export const deployers = readAddressMappingIfExists('deployers.json')
export const fyTokens = readAddressMappingIfExists('fyTokens.json')
export const pools = readAddressMappingIfExists('pools.json')
export const joins = readAddressMappingIfExists('joins.json')
export const strategies = readAddressMappingIfExists('strategies.json')

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
  [USDT, '0x5041ed759dd4afc3a72b8192c143f72f4724081a'],
  [YSDAI6MMSASSET, '0x232c412d3613d5915fc1ebf6eb8d14f11b6a260d'],
  [YSDAI6MJDASSET, '0x9185df15078547055604f5c0b02fc1c8d93594a5'],
  [YSUSDC6MMSASSET, '0x3250e201c2eb06d086138f181e0fb6d1fe33f7d1'],
  [YSUSDC6MJDASSET, '0x64d226daf361f4f2cc5ad48b7501a7ea2598859f'],
  [YSETH6MMSASSET, '0xbe6cce2753c0e99bc9e1b1bea946d35921aabd49'],
  [YSETH6MJDASSET, '0x3336581a28870d343e085beae4cec23f47838899'],
  [YSFRAX6MMSASSET, '0x430e076e5292e0028a0a17a00a65c43e6ee7fb91'],
  [YSFRAX6MJDASSET, '0x3b870db67a45611cf4723d44487eaf398fac51e3'],
  [CRAB, '0xa1cab67a4383312718a5799eaa127906e9d4b19e'],
  [RETH, '0x7c5aaa2a20b01df027ad032f7a768ac015e77b86'],
  [ZENBULL, '0xaae102ca930508e6da30924bf0374f0f247729d5'],
])

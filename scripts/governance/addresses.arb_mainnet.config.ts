import { readAddressMappingIfExists } from '../../shared/helpers'
import { ETH, DAI, USDC, USDT } from '../../shared/constants'

export const external = readAddressMappingIfExists('external.json')
export const assets = readAddressMappingIfExists('assets.json')
export const protocol = readAddressMappingIfExists('protocol.json')
export const governance = readAddressMappingIfExists('governance.json')
export const deployers = readAddressMappingIfExists('deployers.json')
export const fyTokens = readAddressMappingIfExists('fyTokens.json')
export const pools = readAddressMappingIfExists('pools.json')
export const joins = readAddressMappingIfExists('joins.json')
export const strategyAddresses = readAddressMappingIfExists('strategies.json') // TODO: Name clash :(

export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const whales: Map<string, string> = new Map([
  [ETH, '0xBA12222222228d8Ba445958a75a0704d566BF2C8'],
  [DAI, '0xBA12222222228d8Ba445958a75a0704d566BF2C8'],
  [USDC, '0xBA12222222228d8Ba445958a75a0704d566BF2C8'],
  [USDT, '0xBA12222222228d8Ba445958a75a0704d566BF2C8'],
])

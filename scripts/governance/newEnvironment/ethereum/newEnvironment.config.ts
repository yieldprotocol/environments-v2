import { stringToBytes6, bytesToString, readAddressMappingIfExists } from '../../../../shared/helpers'
import { ETH, DAI, USDC, WBTC, WSTETH, STETH, ENS } from '../../../../shared/constants'
import { CHAINLINK, COMPOUND, COMPOSITE, LIDO, UNISWAP } from '../../../../shared/constants'

const protocol = readAddressMappingIfExists('protocol.json');

export const developer = new Map([
    [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
    [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  ])

export const deployer = new Map([
  [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
  [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
])

export const chiSources = new Map([
  [1, [
    [DAI,  '0xf0d0eb522cfa50b716b3b1604c4f0fa6f04376ad'],
    [USDC, '0x4a92e71227d294f041bd82dd8f78591b75140d63'],
  ]],
  [42, [
    [DAI,  '0xf0d0eb522cfa50b716b3b1604c4f0fa6f04376ad'],
    [USDC, '0x4a92e71227d294f041bd82dd8f78591b75140d63'],
  ]],
])

export const rateSources = new Map([
  [1, [
    [DAI,  '0xf0d0eb522cfa50b716b3b1604c4f0fa6f04376ad'],
    [USDC, '0x4a92e71227d294f041bd82dd8f78591b75140d63'],
  ]],
  [42, [
    [DAI,  '0xf0d0eb522cfa50b716b3b1604c4f0fa6f04376ad'],
    [USDC, '0x4a92e71227d294f041bd82dd8f78591b75140d63'],
  ]],
])

export const chainlinkSources = new Map([
  [1, [
    [DAI,  ETH,  '0x22B58f1EbEDfCA50feF632bD73368b2FdA96D541'],
    [USDC, ETH, '0x64EaC61A2DFda2c3Fa04eED49AA33D021AeC8838'],
    [WBTC, ETH, '0xF7904a295A029a3aBDFFB6F12755974a958C7C25'],
    [STETH, ETH, '0xF7904a295A029a3aBDFFB6F12755974a958C7C25'],
  ]],
  [42, [
    [DAI,  ETH,  '0x22B58f1EbEDfCA50feF632bD73368b2FdA96D541'],
    [USDC, ETH, '0x64EaC61A2DFda2c3Fa04eED49AA33D021AeC8838'],
    [WBTC, ETH, '0xF7904a295A029a3aBDFFB6F12755974a958C7C25'],
    [STETH, ETH, '0xF7904a295A029a3aBDFFB6F12755974a958C7C25'],
    [ENS, ETH, '0x19d7cCdB7B4caE085d3Fda330A01D139d7243Be4'],
  ]],
])

export const uniswapSources = new Map([
  [1, [
    [ETH, ENS,  '0x92560c178ce069cc014138ed3c2f5221ba71f58a'],
  ]],
])

export const lidoSource = new Map([
  [1, [
    [ETH, ENS,  '0x92560c178ce069cc014138ed3c2f5221ba71f58a'],
  ]],
  [42, [
    [ETH, ENS,  ''],
  ]],
])

export const compositeSources = new Map([
  [1, [
    [DAI,    ETH,   protocol.get(CHAINLINK) as string],
    [USDC,   ETH,   protocol.get(CHAINLINK) as string],
    [WBTC,   ETH,   protocol.get(CHAINLINK) as string],
    [STETH,  ETH,   protocol.get(CHAINLINK) as string],
    [WSTETH, STETH, protocol.get(LIDO) as string],
    [ENS,    ETH,   protocol.get(UNISWAP) as string],
  ]],
  [42, [
    [DAI,    ETH,   protocol.get(CHAINLINK) as string],
    [USDC,   ETH,   protocol.get(CHAINLINK) as string],
    [WBTC,   ETH,   protocol.get(CHAINLINK) as string],
    [STETH,  ETH,   protocol.get(CHAINLINK) as string],
    [WSTETH, STETH, protocol.get(LIDO) as string],
    [ENS,    ETH,   protocol.get(CHAINLINK) as string], // We don't use Uniswap on kovan
  ]],
])

export const compositePaths = new Map([
  [1, [
    [WSTETH, DAI, [STETH, ETH]],
    [WSTETH, USDC, [STETH, ETH]],
    [ENS, DAI, [ETH]],
    [ENS, USDC, [ETH]],
  ]],
  [42, [
    [WSTETH, DAI, [STETH, ETH]],
    [WSTETH, USDC, [STETH, ETH]],
    [ENS, DAI, [ETH]],
    [ENS, USDC, [ETH]],
  ]],
])

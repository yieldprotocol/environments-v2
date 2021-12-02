import { readAddressMappingIfExists } from '../../../shared/helpers'
import { ETH, DAI, USDC, WBTC, STETH, LINK, ENS } from '../../../shared/constants'
import { CHAINLINK } from '../../../shared/constants'

const protocol = readAddressMappingIfExists('protocol.json');

export const developer: Map<number, string> = new Map([
  [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
  [4, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
])

export const compositeSources: Map<number, Array<[string, string, string]>> = new Map([
  [1, [
    [ETH,    ETH,   protocol.get(CHAINLINK) as string],
    [ETH,    LINK,  protocol.get(CHAINLINK) as string],

    [DAI,    DAI,   protocol.get(CHAINLINK) as string],
    [USDC,   DAI,   protocol.get(CHAINLINK) as string],
    [WBTC,   DAI,   protocol.get(CHAINLINK) as string],
    [STETH,  DAI,   protocol.get(CHAINLINK) as string],
    [LINK,   DAI,   protocol.get(CHAINLINK) as string],

    [DAI,    USDC,   protocol.get(CHAINLINK) as string],
    [USDC,   USDC,   protocol.get(CHAINLINK) as string],
    [WBTC,   USDC,   protocol.get(CHAINLINK) as string],
    [STETH,  USDC,   protocol.get(CHAINLINK) as string],
    [LINK,   USDC,   protocol.get(CHAINLINK) as string],
  ]],
  [4, [
    [ETH,    ETH,   protocol.get(CHAINLINK) as string],
    [ETH,    LINK,  protocol.get(CHAINLINK) as string],

    [DAI,    DAI,   protocol.get(CHAINLINK) as string],
    [USDC,   DAI,   protocol.get(CHAINLINK) as string],
    [WBTC,   DAI,   protocol.get(CHAINLINK) as string],
    [STETH,  DAI,   protocol.get(CHAINLINK) as string],
    [LINK,   DAI,   protocol.get(CHAINLINK) as string],
    [ENS,    DAI,   protocol.get(CHAINLINK) as string], // We don't use Uniswap on rinkeby

    [DAI,    USDC,   protocol.get(CHAINLINK) as string],
    [USDC,   USDC,   protocol.get(CHAINLINK) as string],
    [WBTC,   USDC,   protocol.get(CHAINLINK) as string],
    [STETH,  USDC,   protocol.get(CHAINLINK) as string],
    [LINK,   USDC,   protocol.get(CHAINLINK) as string],
    [ENS,    USDC,   protocol.get(CHAINLINK) as string], // We don't use Uniswap on rinkeby
  ]],
  [42, [
    [ETH,    ETH,   protocol.get(CHAINLINK) as string],
    [ETH,    LINK,  protocol.get(CHAINLINK) as string],

    [DAI,    DAI,   protocol.get(CHAINLINK) as string],
    [USDC,   DAI,   protocol.get(CHAINLINK) as string],
    [WBTC,   DAI,   protocol.get(CHAINLINK) as string],
    [STETH,  DAI,   protocol.get(CHAINLINK) as string],
    [LINK,   DAI,   protocol.get(CHAINLINK) as string],
    [ENS,    DAI,   protocol.get(CHAINLINK) as string], // We don't use Uniswap on kovan

    [DAI,    USDC,   protocol.get(CHAINLINK) as string],
    [USDC,   USDC,   protocol.get(CHAINLINK) as string],
    [WBTC,   USDC,   protocol.get(CHAINLINK) as string],
    [STETH,  USDC,   protocol.get(CHAINLINK) as string],
    [LINK,   USDC,   protocol.get(CHAINLINK) as string],
    [ENS,    USDC,   protocol.get(CHAINLINK) as string], // We don't use Uniswap on kovan
  ]],
])
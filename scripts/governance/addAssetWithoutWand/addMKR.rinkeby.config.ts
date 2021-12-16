 /**
 * @dev Input file for adding MKR as a collateral
 */

import { ETH, DAI, USDC, MKR } from '../../../shared/constants'
import { FYDAI2112, FYDAI2203, FYUSDC2112, FYUSDC2203 } from '../../../shared/constants'

export const deployer: string = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
export const developer: string = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
export const whale = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'

export const assets: Map<string, string> = new Map([
  [ETH,    '0xB370AFD9Efb99BD5CD0aD934AECfF00f949BC69c'],
  [DAI,    '0x32E85Fa11a53ac73067881ef7E56d47a3BCe3e2C'],
  [USDC,   '0xf4aDD9708888e654C042613843f413A8d6aDB8Fe'],
  [MKR,    '0x19AC6E1546B8335C738c97CF6E5D43644AfF2130'],
])
  
export const chainlinkSources: Array<[string, string, string, string, string]> = [
  [MKR,   assets.get(MKR) as string, ETH, assets.get(ETH) as string, '0x87bA5e12ED857983C6E8A2B96e7594919dC8313A'],
]

// Assets for which we will have a Join
// assetId, assetAddress, joinAddress
export const assetsToAdd: [string, string][] = [
   [MKR, assets.get(MKR) as string]
]

// Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), line, dust, dec
export const debtLimits: Array<[string, string, number, number, number, number]> = [
  [DAI,  MKR, 1670000, 1000000, 5000, 18],
  [USDC, MKR, 1670000, 1000000, 5000, 6],
]

// Input data: ilkId, duration, initialOffer, auctionLine, auctionDust, ilkDec
export const auctionLimits: Array<[string, number, number, number, number, number]> = [
  [MKR, 3600, 600000, 1000000, 2, 18],
]

// Input data: seriesId, [ilkId]
export const seriesIlks: Array<[string, string[]]> = [
  [FYDAI2112,  [MKR]],
  [FYDAI2203,  [MKR]],
  [FYUSDC2112, [MKR]],
  [FYUSDC2203, [MKR]],
]

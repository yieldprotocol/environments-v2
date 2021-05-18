import { ethers } from 'hardhat'
import { ETH, DAI, USDC } from '../shared/constants'
import { stringToBytes6 } from '../shared/helpers'

export const TST = stringToBytes6('TST')

export const assetIds: string[] = [DAI, USDC, ETH, TST]
export const baseIds: string[] = [DAI, USDC]
export const ilkIds: Array<[string, string]> = [
    [DAI, USDC],
    [DAI, ETH],
    [DAI, TST],
    [USDC, DAI],
    [USDC, ETH],
    [USDC, TST],
]

export const seriesData: Array<[string, string, number, Array<string>]> = [ // seriesId, baseId, maturity, ilkIds
    [stringToBytes6('DAI1'), DAI, 1625093999, [USDC, ETH, TST]], // Jun21
    [stringToBytes6('DAI2'), DAI, 1633042799, [USDC, ETH, TST]], // Sep21
    [stringToBytes6('USDC1'), USDC, 1625093999, [DAI, ETH, TST]],
    [stringToBytes6('USDC2'), USDC, 1633042799, [DAI, ETH, TST]]
]

export const testAddrsToFund : Array<string> = ['0x885Bc35dC9B10EA39f2d7B3C94a7452a9ea442A7']
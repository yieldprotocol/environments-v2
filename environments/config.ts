import { ethers } from 'hardhat'
import { WAD, ETH, DAI, USDC, WBTC } from '../shared/constants'
import { stringToBytes6 } from '../shared/helpers'

export const TST = stringToBytes6('TST')

// Assets to add to the protocol. A Join will be deployed for each one.
export const assetIds: string[] = [DAI, USDC/*, ETH, TST, WBTC*/]

// Assets to make into underlyings. The assets must exist, as well as rate and chi oracle sources.
export const baseIds: string[] = [DAI/*, USDC*/]

// Assets to make into collaterals, as [underlying, collateral]. The underlying and collateral assets must exist, as well as spot oracle sources for each pair.
export const ilkIds: Array<[string, string]> = [
    [DAI, USDC],
    /*[DAI, ETH],
    [DAI, TST],
    [DAI, WBTC],
    [USDC, DAI],
    [USDC, ETH],
    [USDC, TST],
    [USDC, WBTC],*/
]

// Series to deploy. A FYToken and Pool will be deployed for each one. The underlying assets must exist and have been added as bases. The collaterals accepted must exist and have been added as collateral for the fyToken underlying asset.
export const seriesData: Array<[string, string, number, Array<string>]> = [ // seriesId, baseId, maturity, ilkIds
    [stringToBytes6('DAI1'), DAI, 1625093999, [USDC, ETH, TST, WBTC]], // Jun21
    [stringToBytes6('DAI2'), DAI, 1633042799, [USDC, ETH, TST, WBTC]], // Sep21
    [stringToBytes6('USDC1'), USDC, 1625093999, [DAI, ETH, TST, WBTC]],
    [stringToBytes6('USDC2'), USDC, 1633042799, [DAI, ETH, TST, WBTC]]
]

// Amount of underlying to initialize pools with. It will only work with mock assets. A 1/9 of this amount in fyToken will be minted and added to the pool.
export const initializePools = WAD.mul(1000000)

export const testAddrsToFund : Array<string> = ['0x885Bc35dC9B10EA39f2d7B3C94a7452a9ea442A7']
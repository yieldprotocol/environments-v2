import { WAD, ETH, DAI, USDC, WBTC, USDT } from '../shared/constants'
import { stringToBytes6 } from '../shared/helpers'

export const TST = stringToBytes6('TST')

// Assets to add to the protocol. A Join will be deployed for each one.
export const assetIds: string[] = [DAI, USDC, ETH, TST, WBTC, USDT]

// Assets to make into underlyings. The assets must exist, as well as rate and chi oracle sources.
export const baseIds: string[] = [DAI, USDC, USDT]

// Assets to make into collaterals, as [underlying, collateral]. The underlying and collateral assets must exist, as well as spot oracle sources for each pair.
export const ilkIds: Array<[string, string, number]> = [
    [DAI, DAI, 18], // Constant 1
    [DAI, USDC, 18], // Composite, via ETH
    [DAI, ETH, 18],
    [DAI, TST, 18], // Composite, via ETH
    [DAI, WBTC, 18], // Composite, via ETH
    [DAI, USDT, 18], // Composite, via ETH
    [USDC, USDC, 18], // Constant 1
    [USDC, DAI, 18], // Composite, via ETH
    [USDC, ETH, 18],
    [USDC, TST, 18], // Composite, via ETH
    [USDC, WBTC, 18], // Composite, via ETH
    [USDC, USDT, 18], // Composite, via ETH
    [USDT, USDT, 18], // Constant 1
    [USDT, DAI, 18], // Composite, via ETH
    [USDT, USDC, 18], // Composite, via ETH
    [USDT, ETH, 18],
    [USDT, TST, 18], // Composite, via ETH
    [USDT, WBTC, 18] // Composite, via ETH
]

export const EOSEP21 = 1633042799
export const EODEC21 = 1640995199

// Series to deploy. A FYToken and Pool will be deployed for each one. The underlying assets must exist and have been added as bases. The collaterals accepted must exist and have been added as collateral for the fyToken underlying asset.
export const seriesData: Array<[string, string, number, Array<string>]> = [ // seriesId, baseId, maturity, ilkIds
    [stringToBytes6('DAI1'), DAI, EOSEP21, [DAI, USDC, ETH, TST, WBTC, USDT]], // Sep21
    [stringToBytes6('DAI2'), DAI, EODEC21, [DAI, USDC, ETH, TST, WBTC, USDT]], // Dec21
    [stringToBytes6('USDC1'), USDC, EOSEP21, [USDC, DAI, ETH, TST, WBTC, USDT]],
    [stringToBytes6('USDC2'), USDC, EODEC21, [USDC, DAI, ETH, TST, WBTC, USDT]],
    [stringToBytes6('USDT'), USDT, EOSEP21, [USDT, DAI, USDC, ETH, TST, WBTC]], // TODO: USDT -> USDT1
    [stringToBytes6('USDT2'), USDT, EODEC21, [USDT, DAI, USDC, ETH, TST, WBTC]]
]

// Series to deploy. A FYToken and Pool will be deployed for each one. The underlying assets must exist and have been added as bases. The collaterals accepted must exist and have been added as collateral for the fyToken underlying asset.
export const strategiesData: Array<[string, string, string]> = [ // name, symbol, baseId
    ['DAI3M', 'DAI3M', DAI],
    ['DAI6M', 'DAI6M', DAI],
    ['USDC3M', 'USDC3M', USDC],
    ['USDC6M', 'USDC6M', USDC],
    ['USDT3M', 'USDT3M', USDT],
    ['USDT6M', 'USDT6M', USDT]
]

// Amount of underlying to initialize pools with. It will only work with mock assets. A 1/9 of this amount in fyToken will be minted and added to the pool.
export const initializePools = WAD.mul(1000000)

export const testAddrsToFund : Array<string> = ['0x885Bc35dC9B10EA39f2d7B3C94a7452a9ea442A7']
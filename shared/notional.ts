// The Notional maturities are at precise 90 * 86400 second intervals
export const fCashTenor = (n: number) => n * 90 * 86400

// FCash Ids are obtained by concatenating the currency id, maturity, and 1 for the instrument type
export const fCashId = (currencyId: string, maturity: number) => {
  return parseInt(currencyId) * 4096 + maturity * 4 + 1
}

export const FCASH_ETH = '1'
export const FCASH_DAI = '2'
export const FCASH_USDC = '3'
export const FCASH_WBTC = '4'

export const FCASH_MAR22 = fCashTenor(212) // 1648512000
export const FCASH_JUN22 = fCashTenor(213) // 1656288000
export const FCASH_SEP22 = fCashTenor(214) // 1664064000
export const FCASH_DEC22 = fCashTenor(215) // 1671840000
export const FCASH_MAR23 = fCashTenor(216) // 1679616000
export const FCASH_JUN23 = fCashTenor(217) // 1687392000

export const FDAI2203ID = fCashId(FCASH_DAI, FCASH_MAR22) // 563371972493313
export const FDAI2206ID = fCashId(FCASH_DAI, FCASH_JUN22) // 563373963149313
export const FDAI2209ID = fCashId(FCASH_DAI, FCASH_SEP22) // 563375953805313
export const FDAI2212ID = fCashId(FCASH_DAI, FCASH_DEC22) // 563377944461313
export const FDAI2303ID = fCashId(FCASH_DAI, FCASH_MAR23) // 563380102848513
export const FDAI2306ID = fCashId(FCASH_DAI, FCASH_JUN23)
export const FUSDC2203ID = fCashId(FCASH_DAI, FCASH_MAR22) // 844846949203969
export const FUSDC2206ID = fCashId(FCASH_DAI, FCASH_JUN22) // 844848939859969
export const FUSDC2209ID = fCashId(FCASH_DAI, FCASH_SEP22) // 844850930515969
export const FUSDC2212ID = fCashId(FCASH_DAI, FCASH_DEC22) // 844852921171969
export const FUSDC2303ID = fCashId(FCASH_DAI, FCASH_MAR23) // 844855079559169
export const FUSDC2306ID = fCashId(FCASH_DAI, FCASH_JUN23)

export const FETH2212ID = fCashId(FCASH_ETH, FCASH_DEC22) // 281902967750657
export const FETH2303ID = fCashId(FCASH_ETH, FCASH_MAR23) // 281904958406657
export const FETH2306ID = fCashId(FCASH_ETH, FCASH_JUN23)

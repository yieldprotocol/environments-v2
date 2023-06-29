// The Notional maturities are at precise 90 * 86400 second intervals
export const fCashTenor = (n: number) => n * 90 * 86400

// FCash Ids are obtained by concatenating the currency id, maturity, and 1 for the instrument type
export const fCashId = (currencyId: string, maturity: number) => {
  return parseInt(currencyId) * 2 ** 48 + maturity * 2 ** 8 + 1
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
export const FCASH_SEP23 = fCashTenor(218) // 1695168000
export const FCASH_DEC23 = fCashTenor(219) // 1702944000

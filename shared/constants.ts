import { ethers, BigNumber } from 'ethers'
import { FCASH_JUN23, FCASH_SEP23 } from './notional'

export const ZERO = BigNumber.from(0)
export const ZERO_ADDRESS = '0x' + '00'.repeat(20)
export const DEC6 = BigNumber.from(10).pow(6)
export const WAD = BigNumber.from(10).pow(18)
export const ONEUSDC = BigNumber.from(10).pow(6)
export const ONEWBTC = BigNumber.from(10).pow(8)
export const RAY = BigNumber.from(10).pow(27)
export const MAX128 = BigNumber.from(2).pow(128).sub(1)
export const MAX256 = BigNumber.from(2).pow(256).sub(1)
export const THREE_MONTHS: number = 3 * 30 * 24 * 60 * 60
export const ROOT = '0x00000000'

export const ONE64 = BigNumber.from('18446744073709551616') // In 64.64 format
export const secondsInOneYear = BigNumber.from(31557600)
export const secondsInTenYears = secondsInOneYear.mul(10) // Seconds in 10 years
export const secondsIn25Years = secondsInOneYear.mul(25) // Seconds in 25 years
export const secondsIn30Years = secondsInOneYear.mul(30) // Seconds in 30 years
export const secondsIn40Years = secondsInOneYear.mul(40) // Seconds in 40 years
export const ts = ONE64.div(secondsIn25Years)
export const secondsInOneMinute = 60
export const secondsInOneHour = 60 * secondsInOneMinute

export function stringToBytes6(x: string): string {
  return ethers.utils.formatBytes32String(x).slice(0, 14)
}

export const CHI = stringToBytes6('CHI')
export const RATE = stringToBytes6('RATE')
export const G1 = stringToBytes6('g1')
export const G2 = stringToBytes6('g2')
export const TS = stringToBytes6('ts')

// Return the timestamp of the next Yield maturity from a given timestamp
function nextYieldMaturity(timestamp: number): number {
  // Get the current date and time from the timestamp
  const date = new Date(timestamp)

  // Get the last day of the month
  const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0) // 0 is the last day of the previous month

  // If the last day of the month is a Friday, set the date to it, otherwise set it to the previous Friday
  if (lastDayOfMonth.getDay() === 5) {
    date.setDate(lastDayOfMonth.getDate())
  } else {
    date.setDate(lastDayOfMonth.getDate() - lastDayOfMonth.getDay())
  }

  // Set the time to 3pm
  date.setHours(15)
  date.setMinutes(0)
  date.setSeconds(0)
  date.setMilliseconds(0)

  // Return the resulting timestamp
  return date.getTime()
}

// Returns the timestamp divided by the seconds in a 30 day month, in hexadecimal
export const getIteration = (timestamp: number) => {
  const hex = ethers.utils.hexlify(Math.floor(timestamp / 2592000))
  // return the three last characters of the hexadecimal, padded with zeros if necessary
  return hex.replace('0x', '').slice(-3).padStart(3, '0').toUpperCase()
}

// Return characters 1 to 3 from the hexadecimal asset identifier
export const stripAsset = (assetId: string) => {
  return assetId.slice(3, 6)
}

// Return the seriesId as:
// 0,
// followed by the base asset identifier,
// followed by 'FF' for Yield,
// followed by 3 zeros,
// followed by the iteration
export const getSeriesId = (assetId: string, timestamp: number) => {
  return '0x0' + stripAsset(assetId) + 'FF' + '000' + getIteration(timestamp).replace('0x', '')
}

// Return the poolId as:
// 2,
// followed by the base asset identifier,
// followed by 'FF' for Yield,
// followed by 3 zeros,
// followed by the iteration
export const getPoolId = (assetId: string, timestamp: number) => {
  return '0x2' + stripAsset(assetId) + 'FF' + '000' + getIteration(timestamp).replace('0x', '')
}

// Return the fCash identifier as:
// 4,
// followed by the base asset identifier,
// followed by Notional as provider identifier,
// followed by 3 zeros,
// followed by the iteration
export const getFCashAssetId = (assetId: string, timestamp: number) => {
  return '0x4' + stripAsset(assetId) + NOTIONAL_PROVIDER + '000' + getIteration(timestamp).replace('0x', '')
}

// Return the strategy identifier as:
// 1,
// followed by the base asset identifier,
// followed by 'FF' for Yield,
// followed by 3 zeros,
// followed by 000 for 'MJD' or 001 for 'MMS'
export const getStrategyId = (assetId: string, frequency: string) => {
  return '0x1' + stripAsset(assetId) + 'FF' + '000' + (frequency === 'MJD' ? '000' : '001')
}

export const ETH = stringToBytes6('00')
export const DAI = stringToBytes6('01')
export const USDC = stringToBytes6('02')
export const WBTC = stringToBytes6('03')
export const WSTETH = stringToBytes6('04')
export const STETH = stringToBytes6('05')
export const LINK = stringToBytes6('06')
export const ENS = stringToBytes6('07')
export const YVDAI = stringToBytes6('08')
export const YVUSDC = stringToBytes6('09')
export const UNI = stringToBytes6('10')
export const MKR = stringToBytes6('11')
export const FDAI2203 = stringToBytes6('12')
export const FUSDC2203 = stringToBytes6('13')
export const FDAI2206 = stringToBytes6('14')
export const FUSDC2206 = stringToBytes6('15')
export const FDAI2209 = stringToBytes6('16')
export const FUSDC2209 = stringToBytes6('17')
export const FRAX = stringToBytes6('18')
export const CVX3CRV = stringToBytes6('19')
export const EWETH = stringToBytes6('20')
export const EDAI = stringToBytes6('21')
export const EUSDC = stringToBytes6('22')
export const FDAI2212 = stringToBytes6('23')
export const FUSDC2212 = stringToBytes6('24')
export const FDAI2303 = stringToBytes6('25')
export const FUSDC2303 = stringToBytes6('26')
export const EFRAX = stringToBytes6('27')
export const FETH2212 = stringToBytes6('28')
export const FETH2303 = stringToBytes6('29')
export const YSDAI6MMSASSET = stringToBytes6('30')
export const YSDAI6MJDASSET = stringToBytes6('31')
export const YSUSDC6MMSASSET = stringToBytes6('32')
export const YSUSDC6MJDASSET = stringToBytes6('33')
export const YSETH6MMSASSET = stringToBytes6('34')
export const YSETH6MJDASSET = stringToBytes6('35')
export const YSFRAX6MMSASSET = stringToBytes6('36')
export const YSFRAX6MJDASSET = stringToBytes6('37')
export const CRAB = stringToBytes6('38')
export const OSQTH = stringToBytes6('39')
export const USDT = '0x30A000000000'
export const EUSDT = '0xE0A014000000'
export const RETH = '0xE03016000000'
export const SPWSTETH2304 = '0x403017000289' //sP-wstETH:01-04-2023:8 // Maturity: 1680307200
export const SPCDAI2307 = '0x40311700028C' //sP-cDAI:01-07-2023:8 // Maturity: 1688169600

export const TIMELOCK = 'timelock'
export const CLOAK = 'cloak'
export const CLOAK_V1 = 'cloakV1'
export const MULTISIG = 'multisig'
export const SAFE_ERC20_NAMER = 'safeERC20Namer'
export const YIELDMATH = 'yieldMath'
export const CAULDRON = 'cauldron'
export const LADLE = 'ladle'
export const REPAY_FROM_LADLE_MODULE = 'repayFromLadleModule'
export const WITCH = 'witch'
export const ROLLER = 'roller'
export const WITCH_V1 = 'witchV1'
export const CHAINLINK = 'chainlinkOracle'
export const CHAINLINKUSD = 'chainlinkUSDOracle'
export const ACCUMULATOR = 'accumulatorOracle'
export const COMPOUND = 'compoundOracle'
export const COMPOSITE = 'compositeOracle'
export const LIDO = 'lidoOracle'
export const UNISWAP = 'uniswapOracle'
export const CONVEX3CRV = 'cvx3CrvOracle'
export const YEARN = 'yearnOracle'
export const NOTIONAL = 'notionalOracle'
export const IDENTITY = 'identityOracle'
export const STRATEGY_ORACLE = 'strategyOracle'
export const POOL_ORACLE = 'poolOracle'
export const YIELD_SPACE_MULTI_ORACLE = 'yieldSpaceMultiOracle'
export const CRAB_ORACLE = 'crabOracle'
export const RETH_ORACLE = 'rethOracle'
export const IDENTITY_ORACLE = 'identityOracle'
export const CONTANGO = 'contango'
export const CONTANGO_WITCH = 'contangoWitch'
export const CONTANGO_CAULDRON = 'contangoCauldron'
export const CONTANGO_LADLE = 'contangoLadle'
export const CONTANGO_LADLE_ROUTER = 'contangoLadleRouter'
export const EULER = 'euler'
export const FCASH = 'fCash'
export const GIVER = 'giver'
export const YIELD_STRATEGY_LEVER = 'yieldStrategyLever'
export const YIELD_STETH_LEVER = 'yieldStETHLever'
export const YIELD_NOTIONAL_LEVER = 'yieldNotionalLever'
export const ONCHAINTEST = 'onChainTest'
export const HEALER = 'healerModule'
export const ASSERT = 'assert'
export const LIMITED_ASSERT = 'limitedAssert'
export const ASSERT_V2 = 'assertV2'

export const LIDO_PROVIDER = '10'
export const YEARN_PROVIDER = '11'
export const NOTIONAL_PROVIDER = '12'
export const CONVEX_PROVIDER = '13'
export const EULER_PROVIDER = '14'
export const OPYN_PROVIDER = '15'
export const ROCKET_PROVIDER = '16'
export const SENSE_PROVIDER = '17'

export const EODEC21 = 1640919600 // Friday, Dec 31, 2021 3:00:00 AM GMT+00:00
export const EOMAR22 = 1648177200 // Friday, Mar 25, 2022 3:00:00 AM GMT+00:00
export const EOJUN22 = 1656039600 // Friday, Jun 24, 2022 3:00:00 PM GMT+00:00
export const EOSEP22 = 1664550000 // Friday, Sep 30 2022 15:00:00 GMT+0000
export const EODEC22 = 1672412400 // Friday, Dec 30 2022 15:00:00 GMT+0000
export const EOMAR23 = 1680274800 // Friday, Mar 31 2023 15:00:00 GMT+0000
export const EOJUN23 = 1688137200 // Friday, Jun 30 2023 15:00:00 GMT+0000
export const EOSEP23 = 1695999600 // Friday, Sep 29 2023 15:00:00 GMT+0000
export const EODEC23 = 1703862000 // Friday, Dec 29 2023 15:00:00 GMT+0000
export const EOMAR24 = 1711724400 // Friday, Mar 30 2024 15:00:00 GMT+0000
export const EOJUN24 = 1719586800 // Friday, Jun 29 2024 15:00:00 GMT+0000
export const EOSEP24 = 1727449200 // Friday, Sep 28 2024 15:00:00 GMT+0000
export const EODEC24 = 1735311600 // Friday, Dec 28 2024 15:00:00 GMT+0000

export const FYUSDT2303 = getSeriesId(USDT, EOMAR23) // 0x0 0A0 FF 000 288
export const FYETH2306 = getSeriesId(ETH, EOJUN23) // 0x0 030 FF 000 28B
export const FYDAI2306 = getSeriesId(DAI, EOJUN23) // 0x0 031 FF 000 28B
export const FYUSDC2306 = getSeriesId(USDC, EOJUN23) // 0x0 032 FF 000 28B
export const FYFRAX2306 = getSeriesId(FRAX, EOJUN23) // 0x0 138 FF 000 28B
export const FYUSDT2306 = getSeriesId(USDT, EOJUN23) // 0x0 0A0 FF 000 28B
export const FYETH2309 = getSeriesId(ETH, EOSEP23) // 0x0 030 FF 000 28F
export const FYDAI2309 = getSeriesId(DAI, EOSEP23) // 0x0 031 FF 000 28F
export const FYUSDC2309 = getSeriesId(USDC, EOSEP23) // 0x0 032 FF 000 28F
export const FYFRAX2309 = getSeriesId(FRAX, EOSEP23) // 0x0 138 FF 000 28F
export const FYUSDT2309 = getSeriesId(USDT, EOSEP23) // 0x0 0A0 FF 000 28F

export const FYUSDT2303LP = getPoolId(USDT, EOMAR23) // 0x2 0A0 FF 000 288
export const FYUSDT2306LP = getPoolId(USDT, EOJUN23) // 0x2 0A0 FF 000 28B
export const FYETH2309LP = getPoolId(ETH, EOSEP23) // 0x2 030 FF 000 28F
export const FYDAI2309LP = getPoolId(DAI, EOSEP23) // 0x2 031 FF 000 28F
export const FYUSDC2309LP = getPoolId(USDC, EOSEP23) // 0x2 032 FF 000 28F
export const FYFRAX2309LP = getPoolId(FRAX, EOSEP23) // 0x2 138 FF 000 28F
export const FYUSDT2309LP = getPoolId(USDT, EOSEP23) // 0x2 0A0 FF 000 28F

export const FETH2306 = getFCashAssetId(ETH, FCASH_JUN23) // 0x4 030 12 000 28B
export const FDAI2306 = getFCashAssetId(DAI, FCASH_JUN23) // 0x4 031 12 000 28B
export const FUSDC2306 = getFCashAssetId(USDC, FCASH_JUN23) // 0x4 032 12 000 28B
export const FETH2309 = getFCashAssetId(ETH, FCASH_SEP23) // 0x4 030 12 000 28F
export const FDAI2309 = getFCashAssetId(DAI, FCASH_SEP23) // 0x4 031 12 000 28F
export const FUSDC2309 = getFCashAssetId(USDC, FCASH_SEP23) // 0x4 032 12 000 28F

export const YSETH6MMS = getStrategyId(ETH, 'MMS') // 1 030 FF 000 001 - Yield Strategy ETH 6M Mar Sep - YSETH6MMS
export const YSETH6MJD = getStrategyId(ETH, 'MJD') // 1 030 FF 000 000 - Yield Strategy ETH 6M Jun Dec - YSETH6MJD
export const YSDAI6MMS = getStrategyId(DAI, 'MMS') // 1 031 FF 000 001 - Yield Strategy DAI 6M Mar Sep - YSDAI6MMS
export const YSDAI6MJD = getStrategyId(DAI, 'MJD') // 1 031 FF 000 000 - Yield Strategy DAI 6M Jun Dec - YSDAI6MJD
export const YSUSDC6MMS = getStrategyId(USDC, 'MMS') // 1 032 FF 000 001 - Yield Strategy USDC 6M Mar Sep - YSUSDC6MMS
export const YSUSDC6MJD = getStrategyId(USDC, 'MJD') // 1 032 FF 000 000 - Yield Strategy USDC 6M Jun Dec - YSUSDC6MJD
export const YSFRAX6MMS = getStrategyId(FRAX, 'MMS') // 1 138 FF 000 001 - Yield Strategy FRAX 6M Mar Sep - YSFRAX6MMS
export const YSFRAX6MJD = getStrategyId(FRAX, 'MJD') // 1 138 FF 000 000 - Yield Strategy FRAX 6M Jun Dec - YSFRAX6MJD
export const YSUSDT6MMS = getStrategyId(USDT, 'MMS') // 1 0A0 FF 000 001 - Yield Strategy USDT 6M Mar Sep - YSFRAX6MMS
export const YSUSDT6MJD = getStrategyId(USDT, 'MJD') // 1 0A0 FF 000 000 - Yield Strategy USDT 6M Jun Dec - YSFRAX6MJD

// LEGACY IDENTIFIERS

export const YSDAI6MMS_V1 = 'YSDAI6MMS'
export const YSDAI6MJD_V1 = 'YSDAI6MJD'
export const YSUSDC6MMS_V1 = 'YSUSDC6MMS'
export const YSUSDC6MJD_V1 = 'YSUSDC6MJD'
export const YSETH6MMS_V1 = 'YSETH6MMS'
export const YSETH6MJD_V1 = 'YSETH6MJD'
export const YSFRAX6MMS_V1 = 'YSFRAX6MMS'
export const YSFRAX6MJD_V1 = 'YSFRAX6MJD'

// Note: The first two digits are the borrowable asset, the second two are the quarters since Q1 2021
export const FYETH2203 = stringToBytes6('0005') // End of 5th quarter from 1st January 2021
export const FYETH2206 = stringToBytes6('0006') // End of 6th quarter from 1st January 2021
export const FYETH2209 = stringToBytes6('0007')
export const FYETH2212 = stringToBytes6('0008')
export const FYETH2303 = stringToBytes6('0009')
export const FYDAI2112 = stringToBytes6('0104')
export const FYDAI2203 = stringToBytes6('0105')
export const FYDAI2206 = stringToBytes6('0106')
export const FYDAI2209 = stringToBytes6('0107')
export const FYDAI2212 = stringToBytes6('0108')
export const FYDAI2303 = stringToBytes6('0109')
export const FYUSDC2112 = stringToBytes6('0204')
export const FYUSDC2203 = stringToBytes6('0205')
export const FYUSDC2206 = stringToBytes6('0206')
export const FYUSDC2209 = stringToBytes6('0207')
export const FYUSDC2212 = stringToBytes6('0208')
export const FYUSDC2303 = stringToBytes6('0209')
export const FYFRAX2206 = stringToBytes6('0306') // Incorrectly labelled
export const FYFRAX2209 = stringToBytes6('0307') // Incorrectly labelled
export const FYFRAX2212 = stringToBytes6('1808')
export const FYFRAX2303 = stringToBytes6('1809')

export const DISPLAY_NAMES = new Map([
  [CHI, 'CHI'],
  [RATE, 'RATE'],
  [ETH, 'ETH'],
  [DAI, 'DAI'],
  [USDC, 'USDC'],
  [USDT, 'USDT'],
  [WBTC, 'WBTC'],
  [WSTETH, 'WSTETH'],
  [STETH, 'STETH'],
  [LINK, 'LINK'],
  [ENS, 'ENS'],
  [YVDAI, 'YVDAI'],
  [YVUSDC, 'YVUSDC'],
  [UNI, 'UNI'],
  [MKR, 'MKR'],
  [FRAX, 'FRAX'],
  [CVX3CRV, 'CVX3CRV'],
  [EWETH, 'EWETH'],
  [EDAI, 'EDAI'],
  [EUSDC, 'EUSDC'],
  [EFRAX, 'EFRAX'],
  [RETH, 'RETH'],
  [SPWSTETH2304, 'SPWSTETH2304'],
  [SPCDAI2307, 'SPCDAI2307'],
  [FDAI2203, 'FDAI2203'],
  [FUSDC2203, 'FUSDC2203'],
  [FDAI2206, 'FDAI2206'],
  [FUSDC2206, 'FUSDC2206'],
  [FDAI2209, 'FDAI2209'],
  [FUSDC2209, 'FUSDC2209'],
  [FDAI2212, 'FDAI2212'],
  [FUSDC2212, 'FUSDC2212'],
  [FDAI2303, 'FDAI2303'],
  [FUSDC2303, 'FUSDC2303'],
  [FETH2212, 'FETH2212'],
  [FETH2303, 'FETH2303'],
  [FETH2306, 'FETH2306'],
  [FDAI2306, 'FDAI2306'],
  [FUSDC2306, 'FUSDC2306'],
  [FYETH2203, 'FYETH2203'],
  [FYETH2206, 'FYETH2206'],
  [FYETH2209, 'FYETH2209'],
  [FYETH2212, 'FYETH2212'],
  [FYETH2303, 'FYETH2303'],
  [FYDAI2112, 'FYDAI2112'],
  [FYDAI2203, 'FYDAI2203'],
  [FYDAI2206, 'FYDAI2206'],
  [FYDAI2209, 'FYDAI2209'],
  [FYDAI2212, 'FYDAI2212'],
  [FYDAI2303, 'FYDAI2303'],
  [FYUSDC2112, 'FYUSDC2112'],
  [FYUSDC2203, 'FYUSDC2203'],
  [FYUSDC2206, 'FYUSDC2206'],
  [FYUSDC2209, 'FYUSDC2209'],
  [FYUSDC2212, 'FYUSDC2212'],
  [FYUSDC2303, 'FYUSDC2303'],
  [FYFRAX2206, 'FYFRAX2206'],
  [FYFRAX2209, 'FYFRAX2209'],
  [FYFRAX2212, 'FYFRAX2212'],
  [FYFRAX2303, 'FYFRAX2303'],
  [FYUSDT2303, 'FYUSDT2303'],
  [FYETH2306, 'FYETH2306'],
  [FYDAI2306, 'FYDAI2306'],
  [FYUSDC2306, 'FYUSDC2306'],
  [FYFRAX2306, 'FYFRAX2306'],
  [FYUSDT2306, 'FYUSDT2306'],
  [FYETH2309, 'FYETH2309'],
  [FYDAI2309, 'FYDAI2309'],
  [FYUSDC2309, 'FYUSDC2309'],
  [FYFRAX2309, 'FYFRAX2309'],
  [FYUSDT2309, 'FYUSDT2309'],
  [FYUSDT2303LP, 'FYUSDT2303LP'],
  [FYUSDT2306LP, 'FYUSDT2306LP'],
  [FYETH2309LP, 'FYETH2309LP'],
  [FYDAI2309LP, 'FYDAI2309LP'],
  [FYUSDC2309LP, 'FYUSDC2309LP'],
  [FYFRAX2309LP, 'FYFRAX2309LP'],
  [FYUSDT2309LP, 'FYUSDT2309LP'],
  [YSETH6MMS, 'YSETH6MMS'],
  [YSETH6MJD, 'YSETH6MJD'],
  [YSDAI6MMS, 'YSDAI6MMS'],
  [YSDAI6MJD, 'YSDAI6MJD'],
  [YSUSDC6MMS, 'YSUSDC6MMS'],
  [YSUSDC6MJD, 'YSUSDC6MJD'],
  [YSFRAX6MMS, 'YSFRAX6MMS'],
  [YSFRAX6MJD, 'YSFRAX6MJD'],
  [YSUSDT6MMS, 'YSUSDT6MMS'],
  [YSUSDT6MJD, 'YSUSDT6MJD'],
  [YSDAI6MMS_V1, 'YSDAI6MMS_V1'],
  [YSDAI6MJD_V1, 'YSDAI6MJD_V1'],
  [YSUSDC6MMS_V1, 'YSUSDC6MMS_V1'],
  [YSUSDC6MJD_V1, 'YSUSDC6MJD_V1'],
  [YSETH6MMS_V1, 'YSETH6MMS_V1'],
  [YSETH6MJD_V1, 'YSETH6MJD_V1'],
  [YSFRAX6MMS_V1, 'YSFRAX6MMS_V1'],
  [YSFRAX6MJD_V1, 'YSFRAX6MJD_V1'],
])

import { ethers, BigNumber } from 'ethers'
import { FCASH_JUN23 } from './notional'

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

export const CHI = ethers.utils.formatBytes32String('CHI').slice(0, 14)
export const RATE = ethers.utils.formatBytes32String('RATE').slice(0, 14)
export const G1 = ethers.utils.formatBytes32String('g1')
export const G2 = ethers.utils.formatBytes32String('g2')
export const TS = ethers.utils.formatBytes32String('ts')

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
  const hex = ethers.utils.hexlify(Math.floor(timestamp / 2592000)).toUpperCase()
  // return the three last characters of the hexadecimal
  return hex.slice(hex.length - 3, hex.length)
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

export const ETH = ethers.utils.formatBytes32String('00').slice(0, 14)
export const DAI = ethers.utils.formatBytes32String('01').slice(0, 14)
export const USDC = ethers.utils.formatBytes32String('02').slice(0, 14)
export const WBTC = ethers.utils.formatBytes32String('03').slice(0, 14)
export const WSTETH = ethers.utils.formatBytes32String('04').slice(0, 14)
export const STETH = ethers.utils.formatBytes32String('05').slice(0, 14)
export const LINK = ethers.utils.formatBytes32String('06').slice(0, 14)
export const ENS = ethers.utils.formatBytes32String('07').slice(0, 14)
export const YVDAI = ethers.utils.formatBytes32String('08').slice(0, 14)
export const YVUSDC = ethers.utils.formatBytes32String('09').slice(0, 14)
export const UNI = ethers.utils.formatBytes32String('10').slice(0, 14)
export const MKR = ethers.utils.formatBytes32String('11').slice(0, 14)
export const FDAI2203 = ethers.utils.formatBytes32String('12').slice(0, 14)
export const FUSDC2203 = ethers.utils.formatBytes32String('13').slice(0, 14)
export const FDAI2206 = ethers.utils.formatBytes32String('14').slice(0, 14)
export const FUSDC2206 = ethers.utils.formatBytes32String('15').slice(0, 14)
export const FDAI2209 = ethers.utils.formatBytes32String('16').slice(0, 14)
export const FUSDC2209 = ethers.utils.formatBytes32String('17').slice(0, 14)
export const FRAX = ethers.utils.formatBytes32String('18').slice(0, 14)
export const CVX3CRV = ethers.utils.formatBytes32String('19').slice(0, 14)
export const EWETH = ethers.utils.formatBytes32String('20').slice(0, 14)
export const EDAI = ethers.utils.formatBytes32String('21').slice(0, 14)
export const EUSDC = ethers.utils.formatBytes32String('22').slice(0, 14)
export const FDAI2212 = ethers.utils.formatBytes32String('23').slice(0, 14)
export const FUSDC2212 = ethers.utils.formatBytes32String('24').slice(0, 14)
export const FDAI2303 = ethers.utils.formatBytes32String('25').slice(0, 14)
export const FUSDC2303 = ethers.utils.formatBytes32String('26').slice(0, 14)
export const EFRAX = ethers.utils.formatBytes32String('27').slice(0, 14)
export const FETH2212 = ethers.utils.formatBytes32String('28').slice(0, 14)
export const FETH2303 = ethers.utils.formatBytes32String('29').slice(0, 14)
export const YSDAI6MMSASSET = ethers.utils.formatBytes32String('30').slice(0, 14)
export const YSDAI6MJDASSET = ethers.utils.formatBytes32String('31').slice(0, 14)
export const YSUSDC6MMSASSET = ethers.utils.formatBytes32String('32').slice(0, 14)
export const YSUSDC6MJDASSET = ethers.utils.formatBytes32String('33').slice(0, 14)
export const YSETH6MMSASSET = ethers.utils.formatBytes32String('34').slice(0, 14)
export const YSETH6MJDASSET = ethers.utils.formatBytes32String('35').slice(0, 14)
export const YSFRAX6MMSASSET = ethers.utils.formatBytes32String('36').slice(0, 14)
export const YSFRAX6MJDASSET = ethers.utils.formatBytes32String('37').slice(0, 14)

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
export const POOL_ORACLE = 'poolOracle'
export const YIELD_SPACE_MULTI_ORACLE = 'yieldSpaceMultiOracle'
export const CONTANGO_WITCH = 'contangoWitch'
export const CONTANGO_CAULDRON = 'contangoCauldron'
export const CONTANGO_LADLE = 'contangoLadle'
export const CONTANGO_LADLE_ROUTER = 'contangoLadleRouter'
export const EULER = 'euler'
export const FCASH = 'fCash'
export const GIVER = 'giver'
export const YIELD_STRATEGY_LEVER = 'yieldStrategyLever'

export const LIDO_PROVIDER = '10'
export const YEARN_PROVIDER = '11'
export const NOTIONAL_PROVIDER = '12'
export const CONVEX_PROVIDER = '13'
export const EULER_PROVIDER = '14'
export const OPYN_PROVIDER = '15'

export const EODEC21 = 1640919600 // Friday, Dec 31, 2021 3:00:00 AM GMT+00:00
export const EOMAR22 = 1648177200 // Friday, Mar 25, 2022 3:00:00 AM GMT+00:00
export const EOJUN22 = 1656039600 // Friday, Jun 24, 2022 3:00:00 PM GMT+00:00
export const EOSEP22 = 1664550000 // Friday, Sep 30 2022 15:00:00 GMT+0000
export const EODEC22 = 1672412400 // Friday, Dec 30 2022 15:00:00 GMT+0000
export const EOMAR23 = 1680274800 // Friday, Mar 31 2023 15:00:00 GMT+0000

export const EOJUN23 = 1688137200 // TODO: nextYieldMaturity(FCASH_JUN23) // 1688137200 - Friday, Jun 30 2023 15:00:00 GMT+0000

export const FYETH2306 = getSeriesId(ETH, EOJUN23) // 0x0 030 FF 000 28B
export const FYDAI2306 = getSeriesId(DAI, EOJUN23) // 0x0 031 FF 000 28B
export const FYUSDC2306 = getSeriesId(USDC, EOJUN23) // 0x0 032 FF 000 28B
export const FYFRAX2306 = getSeriesId(FRAX, EOJUN23) // 0x0 138 FF 000 28B

export const FETH2306 = getFCashAssetId(ETH, FCASH_JUN23) // 0x4 030 12 000 28B
export const FDAI2306 = getFCashAssetId(DAI, FCASH_JUN23) // 0x4 031 12 000 28B
export const FUSDC2306 = getFCashAssetId(USDC, FCASH_JUN23) // 0x4 032 12 000 28B

export const YSETH6MMS = getStrategyId(ETH, 'MMS') // 1 030 FF 000 001 - Yield Strategy ETH 6M Mar Sep - YSETH6MMS
export const YSETH6MJD = getStrategyId(ETH, 'MJD') // 1 030 FF 000 000 - Yield Strategy ETH 6M Jun Dec - YSETH6MJD
export const YSDAI6MMS = getStrategyId(DAI, 'MMS') // 1 031 FF 000 001 - Yield Strategy DAI 6M Mar Sep - YSDAI6MMS
export const YSDAI6MJD = getStrategyId(DAI, 'MJD') // 1 031 FF 000 000 - Yield Strategy DAI 6M Jun Dec - YSDAI6MJD
export const YSUSDC6MMS = getStrategyId(USDC, 'MMS') // 1 032 FF 000 001 - Yield Strategy USDC 6M Mar Sep - YSUSDC6MMS
export const YSUSDC6MJD = getStrategyId(USDC, 'MJD') // 1 032 FF 000 000 - Yield Strategy USDC 6M Jun Dec - YSUSDC6MJD
export const YSFRAX6MMS = getStrategyId(FRAX, 'MMS') // 1 138 FF 000 001 - Yield Strategy FRAX 6M Mar Sep - YSFRAX6MMS
export const YSFRAX6MJD = getStrategyId(FRAX, 'MJD') // 1 138 FF 000 000 - Yield Strategy FRAX 6M Jun Dec - YSFRAX6MJD

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
export const FYETH2203 = ethers.utils.formatBytes32String('0005').slice(0, 14) // End of 5th quarter from 1st January 2021
export const FYETH2206 = ethers.utils.formatBytes32String('0006').slice(0, 14) // End of 6th quarter from 1st January 2021
export const FYETH2209 = ethers.utils.formatBytes32String('0007').slice(0, 14)
export const FYETH2212 = ethers.utils.formatBytes32String('0008').slice(0, 14)
export const FYETH2303 = ethers.utils.formatBytes32String('0009').slice(0, 14)
export const FYDAI2112 = ethers.utils.formatBytes32String('0104').slice(0, 14)
export const FYDAI2203 = ethers.utils.formatBytes32String('0105').slice(0, 14)
export const FYDAI2206 = ethers.utils.formatBytes32String('0106').slice(0, 14)
export const FYDAI2209 = ethers.utils.formatBytes32String('0107').slice(0, 14)
export const FYDAI2212 = ethers.utils.formatBytes32String('0108').slice(0, 14)
export const FYDAI2303 = ethers.utils.formatBytes32String('0109').slice(0, 14)
export const FYUSDC2112 = ethers.utils.formatBytes32String('0204').slice(0, 14)
export const FYUSDC2203 = ethers.utils.formatBytes32String('0205').slice(0, 14)
export const FYUSDC2206 = ethers.utils.formatBytes32String('0206').slice(0, 14)
export const FYUSDC2209 = ethers.utils.formatBytes32String('0207').slice(0, 14)
export const FYUSDC2212 = ethers.utils.formatBytes32String('0208').slice(0, 14)
export const FYUSDC2303 = ethers.utils.formatBytes32String('0209').slice(0, 14)
export const FYFRAX2206 = ethers.utils.formatBytes32String('0306').slice(0, 14) // Incorrectly labelled
export const FYFRAX2209 = ethers.utils.formatBytes32String('0307').slice(0, 14) // Incorrectly labelled
export const FYFRAX2212 = ethers.utils.formatBytes32String('1808').slice(0, 14)
export const FYFRAX2303 = ethers.utils.formatBytes32String('1809').slice(0, 14)

export const DISPLAY_NAMES = new Map([
  [ETH, 'ETH'],
  [DAI, 'DAI'],
  [USDC, 'USDC'],
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
  [FYETH2306, 'FYETH2306'],
  [FYDAI2306, 'FYDAI2306'],
  [FYUSDC2306, 'FYUSDC2306'],
  [FYFRAX2306, 'FYFRAX2306'],
  [YSETH6MMS, 'YSETH6MMS'],
  [YSETH6MJD, 'YSETH6MJD'],
  [YSDAI6MMS, 'YSDAI6MMS'],
  [YSDAI6MJD, 'YSDAI6MJD'],
  [YSUSDC6MMS, 'YSUSDC6MMS'],
  [YSUSDC6MJD, 'YSUSDC6MJD'],
  [YSFRAX6MMS, 'YSFRAX6MMS'],
  [YSFRAX6MJD, 'YSFRAX6MJD'],
  [YSDAI6MMS_V1, 'YSDAI6MMS_V1'],
  [YSDAI6MJD_V1, 'YSDAI6MJD_V1'],
  [YSUSDC6MMS_V1, 'YSUSDC6MMS_V1'],
  [YSUSDC6MJD_V1, 'YSUSDC6MJD_V1'],
  [YSETH6MMS_V1, 'YSETH6MMS_V1'],
  [YSETH6MJD_V1, 'YSETH6MJD_V1'],
  [YSFRAX6MMS_V1, 'YSFRAX6MMS_V1'],
  [YSFRAX6MJD_V1, 'YSFRAX6MJD_V1'],
])

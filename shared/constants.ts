import { BigNumber } from 'ethers'
import { stringToBytes6 } from './helpers'

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

export const ETH = stringToBytes6('00')
export const DAI = stringToBytes6('01')
export const USDC = stringToBytes6('02')
export const WBTC = stringToBytes6('03')
export const WSTETH = stringToBytes6('04')
export const STETH = stringToBytes6('05')
export const LINK = stringToBytes6('06')
export const ENS = stringToBytes6('07')
export const YVDAI = stringToBytes6('08')
//NOTE, We are using the following YVUSDC constant to represent the yvUSDC token (api 0.4.3)
//      found here: https://etherscan.io/token/0xa354F35829Ae975e850e23e9615b11Da1B3dC4DE
//      There is also another yvUSDC token (api 0.3.0) that we are not using found here:
//      https://etherscan.io/token/0x5f18c75abdae578b483e5f43f12a39cf75b973a9 <<NOT USING THIS ONE
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

export const TIMELOCK = 'timelock'
export const CLOAK = 'cloak'
export const CLOAK_V1 = 'cloakV1'
export const MULTISIG = 'multisig'
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
export const CRAB_ORACLE = 'crabOracle'
export const CONTANGO = 'contango'
export const CONTANGO_WITCH = 'contangoWitch'
export const CONTANGO_CAULDRON = 'contangoCauldron'
export const CONTANGO_LADLE = 'contangoLadle'
export const CONTANGO_LADLE_ROUTER = 'contangoLadleRouter'
export const FCASH = 'fCash'
export const GIVER = 'giver'
export const YIELD_STRATEGY_LEVER = 'yieldStrategyLever'

export const EODEC21 = 1640919600 // Friday, Dec 31, 2021 3:00:00 AM GMT+00:00
export const EOMAR22 = 1648177200 // Friday, Mar 25, 2022 3:00:00 AM GMT+00:00
export const EOJUN22 = 1656039600 // Friday, Jun 24, 2022 3:00:00 PM GMT+00:00
export const EOSEP22 = 1664550000 // Friday, Sep 30 2022 15:00:00 GMT+0000
export const EODEC22 = 1672412400 // Friday, Dec 30 2022 15:00:00 GMT+0000
export const EOMAR23 = 1680274800 // Friday, Mar 31 2023 15:00:00 GMT+0000
export const EOJUN23 = 1688137200 // Friday, Jun 30 2023 15:00:00 GMT+0000

export const FCASH_MAR22 = 1648512000 // 212 * (86400 * 90)
export const FCASH_JUN22 = 1656288000 // 213 * (86400 * 90)
export const FCASH_SEP22 = 1664064000 // 214 * (86400 * 90)
export const FCASH_DEC22 = 1671840000 // 215 * (86400 * 90)
export const FCASH_MAR23 = 1679616000 // 216 * (86400 * 90)
export const FCASH_ETH = '1'
export const FCASH_DAI = '2'
export const FCASH_USDC = '3'
export const FCASH_WBTC = '4'

// CurrencyId*(16**12)+Maturity*(16**2)+1 = 563371972493313
export const FDAI2203ID = 563371972493313
export const FDAI2206ID = 563373963149313
export const FDAI2209ID = 563375953805313
export const FDAI2212ID = 563377944461313
export const FDAI2303ID = 563380102848513
export const FUSDC2203ID = 844846949203969
export const FUSDC2206ID = 844848939859969
export const FUSDC2209ID = 844850930515969
export const FUSDC2212ID = 844852921171969
export const FUSDC2303ID = 844855079559169
export const FETH2212ID = 281902967750657
export const FETH2303ID = 281904958406657

// Note: The first two digits are the borrowable asset, the second two are the quarters since Q1 2021
export const FYETH2203 = stringToBytes6('0005') // End of 5th quarter from 1st January 2021
export const FYETH2206 = stringToBytes6('0006') // End of 6th quarter from 1st January 2021
export const FYETH2209 = stringToBytes6('0007')
export const FYETH2212 = stringToBytes6('0008')
export const FYETH2303 = stringToBytes6('0009')
export const FYETH2306 = stringToBytes6('0010')
export const FYDAI2112 = stringToBytes6('0104')
export const FYDAI2203 = stringToBytes6('0105')
export const FYDAI2206 = stringToBytes6('0106')
export const FYDAI2209 = stringToBytes6('0107')
export const FYDAI2212 = stringToBytes6('0108')
export const FYDAI2303 = stringToBytes6('0109')
export const FYDAI2306 = stringToBytes6('0110')
export const FYUSDC2112 = stringToBytes6('0204')
export const FYUSDC2203 = stringToBytes6('0205')
export const FYUSDC2206 = stringToBytes6('0206')
export const FYUSDC2209 = stringToBytes6('0207')
export const FYUSDC2212 = stringToBytes6('0208')
export const FYUSDC2303 = stringToBytes6('0209')
export const FYUSDC2306 = stringToBytes6('0210')
export const FYFRAX2206 = stringToBytes6('0306') // Incorrectly labelled
export const FYFRAX2209 = stringToBytes6('0307') // Incorrectly labelled
export const FYFRAX2212 = stringToBytes6('1808')
export const FYFRAX2303 = stringToBytes6('1809')
export const FYFRAX2306 = stringToBytes6('1810')

export const YSDAI6MMS = 'YSDAI6MMS' // Yield Strategy DAI 6M Mar Sep
export const YSDAI6MJD = 'YSDAI6MJD' // Yield Strategy DAI 6M Jun Dec
export const YSUSDT6MMS = 'YSUSDT6MMS' // Yield Strategy USDT 6M Mar Sep
export const YSUSDT6MJD = 'YSUSDT6MJD' // Yield Strategy USDT 6M Jun Dec
export const YSUSDC6MMS = 'YSUSDC6MMS' // Yield Strategy USDC 6M Mar Sep
export const YSUSDC6MJD = 'YSUSDC6MJD' // Yield Strategy USDC 6M Jun Dec
export const YSETH6MMS = 'YSETH6MMS' // Yield Strategy ETH 6M Mar Sep
export const YSETH6MJD = 'YSETH6MJD' // Yield Strategy ETH 6M Jun Dec
export const YSFRAX6MMS = 'YSFRAX6MMS' // Yield Strategy FRAX 6M Mar Sep
export const YSFRAX6MJD = 'YSFRAX6MJD' // Yield Strategy FRAX 6M Jun Dec

export const ONE64 = BigNumber.from('18446744073709551616') // In 64.64 format
export const secondsInOneYear = BigNumber.from(31557600)
export const secondsInTenYears = secondsInOneYear.mul(10) // Seconds in 10 years
export const secondsIn25Years = secondsInOneYear.mul(25) // Seconds in 25 years
export const secondsIn30Years = secondsInOneYear.mul(30) // Seconds in 30 years
export const secondsIn40Years = secondsInOneYear.mul(40) // Seconds in 40 years
export const ts = ONE64.div(secondsIn25Years)
export const secondsInOneMinute = 60
export const secondsInOneHour = 60 * secondsInOneMinute

export const g0 = ONE64 // No fees
export const g1 = ONE64.mul(950).div(1000) // Sell base to the pool
export const g2 = ONE64.mul(1000).div(950) // Sell fyToken to the pool

export const CHI = stringToBytes6('CHI')
export const RATE = stringToBytes6('RATE')
export const G1 = stringToBytes6('g1')
export const G2 = stringToBytes6('g2')
export const TS = stringToBytes6('ts')

export const DISPLAY_NAMES = new Map([
  [ETH, 'ETH'],
  [USDC, 'USDC'],
  [DAI, 'DAI'],
  [WBTC, 'WBTC'],
  [WSTETH, 'WSTETH'],
  [LINK, 'LINK'],
  [ENS, 'ENS'],
  [UNI, 'UNI'],
  [FRAX, 'FRAX'],
])

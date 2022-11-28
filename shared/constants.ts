import { ethers, BigNumber } from 'ethers'

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

export const ETH = ethers.utils.formatBytes32String('00').slice(0, 14)
export const DAI = ethers.utils.formatBytes32String('01').slice(0, 14)
export const USDC = ethers.utils.formatBytes32String('02').slice(0, 14)
export const WBTC = ethers.utils.formatBytes32String('03').slice(0, 14)
export const WSTETH = ethers.utils.formatBytes32String('04').slice(0, 14)
export const STETH = ethers.utils.formatBytes32String('05').slice(0, 14)
export const LINK = ethers.utils.formatBytes32String('06').slice(0, 14)
export const ENS = ethers.utils.formatBytes32String('07').slice(0, 14)
export const YVDAI = ethers.utils.formatBytes32String('08').slice(0, 14)
//NOTE, We are using the following YVUSDC constant to represent the yvUSDC token (api 0.4.3)
//      found here: https://etherscan.io/token/0xa354F35829Ae975e850e23e9615b11Da1B3dC4DE
//      There is also another yvUSDC token (api 0.3.0) that we are not using found here:
//      https://etherscan.io/token/0x5f18c75abdae578b483e5f43f12a39cf75b973a9 <<NOT USING THIS ONE
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
export const CRAB = ethers.utils.formatBytes32String('38').slice(0, 14)
export const OSQTH = ethers.utils.formatBytes32String('39').slice(0, 14)

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
export const FYETH2203 = ethers.utils.formatBytes32String('0005').slice(0, 14) // End of 5th quarter from 1st January 2021
export const FYETH2206 = ethers.utils.formatBytes32String('0006').slice(0, 14) // End of 6th quarter from 1st January 2021
export const FYETH2209 = ethers.utils.formatBytes32String('0007').slice(0, 14)
export const FYETH2212 = ethers.utils.formatBytes32String('0008').slice(0, 14)
export const FYETH2303 = ethers.utils.formatBytes32String('0009').slice(0, 14)
export const FYETH2306 = ethers.utils.formatBytes32String('0010').slice(0, 14)
export const FYDAI2112 = ethers.utils.formatBytes32String('0104').slice(0, 14)
export const FYDAI2203 = ethers.utils.formatBytes32String('0105').slice(0, 14)
export const FYDAI2206 = ethers.utils.formatBytes32String('0106').slice(0, 14)
export const FYDAI2209 = ethers.utils.formatBytes32String('0107').slice(0, 14)
export const FYDAI2212 = ethers.utils.formatBytes32String('0108').slice(0, 14)
export const FYDAI2303 = ethers.utils.formatBytes32String('0109').slice(0, 14)
export const FYDAI2306 = ethers.utils.formatBytes32String('0110').slice(0, 14)
export const FYUSDC2112 = ethers.utils.formatBytes32String('0204').slice(0, 14)
export const FYUSDC2203 = ethers.utils.formatBytes32String('0205').slice(0, 14)
export const FYUSDC2206 = ethers.utils.formatBytes32String('0206').slice(0, 14)
export const FYUSDC2209 = ethers.utils.formatBytes32String('0207').slice(0, 14)
export const FYUSDC2212 = ethers.utils.formatBytes32String('0208').slice(0, 14)
export const FYUSDC2303 = ethers.utils.formatBytes32String('0209').slice(0, 14)
export const FYUSDC2306 = ethers.utils.formatBytes32String('0210').slice(0, 14)
export const FYFRAX2206 = ethers.utils.formatBytes32String('0306').slice(0, 14) // Incorrectly labelled
export const FYFRAX2209 = ethers.utils.formatBytes32String('0307').slice(0, 14) // Incorrectly labelled
export const FYFRAX2212 = ethers.utils.formatBytes32String('1808').slice(0, 14)
export const FYFRAX2303 = ethers.utils.formatBytes32String('1809').slice(0, 14)
export const FYFRAX2306 = ethers.utils.formatBytes32String('1810').slice(0, 14)

export const YSDAI6MMS = 'YSDAI6MMS' // Yield Strategy DAI 6M Mar Sep
export const YSDAI6MJD = 'YSDAI6MJD' // Yield Strategy DAI 6M Jun Dec
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

export const CHI = ethers.utils.formatBytes32String('CHI').slice(0, 14)
export const RATE = ethers.utils.formatBytes32String('RATE').slice(0, 14)
export const G1 = ethers.utils.formatBytes32String('g1')
export const G2 = ethers.utils.formatBytes32String('g2')
export const TS = ethers.utils.formatBytes32String('ts')

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

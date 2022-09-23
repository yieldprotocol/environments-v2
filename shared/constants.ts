import { ethers, BigNumber } from 'ethers'

export const base = {
  ZERO: BigNumber.from(0),
  ZERO_ADDRESS: '0x' + '00'.repeat(20),
  DEC6: BigNumber.from(10).pow(6),
  WAD: BigNumber.from(10).pow(18),
  ONEUSDC: BigNumber.from(10).pow(6),
  ONEWBTC: BigNumber.from(10).pow(8),
  RAY: BigNumber.from(10).pow(27),
  MAX128: BigNumber.from(2).pow(128).sub(1),
  MAX256: BigNumber.from(2).pow(256).sub(1),
  THREE_MONTHS: 3 * 30 * 24 * 60 * 60,
  ROOT: '0x00000000',
}

export const ilkIds = {
  ETH: ethers.utils.formatBytes32String('00').slice(0, 14),
  DAI: ethers.utils.formatBytes32String('01').slice(0, 14),
  USDC: ethers.utils.formatBytes32String('02').slice(0, 14),
  WBTC: ethers.utils.formatBytes32String('03').slice(0, 14),
  WSTETH: ethers.utils.formatBytes32String('04').slice(0, 14),
  STETH: ethers.utils.formatBytes32String('05').slice(0, 14),
  LINK: ethers.utils.formatBytes32String('06').slice(0, 14),
  ENS: ethers.utils.formatBytes32String('07').slice(0, 14),
  YVDAI: ethers.utils.formatBytes32String('08').slice(0, 14),
  //NOTE: We are using the following YVUSDC ant to represent the yvUSDC token (api 0.4.3)
  //      found here: https://etherscan.io/token/0xa354F35829Ae975e850e23e9615b11Da1B3dC4DE
  //      There is also another yvUSDC token (api 0.3.0) that we are not using found here:
  //      https://etherscan.io/token/0x5f18c75abdae578b483e5f43f12a39cf75b973a9 <<NOT USING THIS ONE
  YVUSDC: ethers.utils.formatBytes32String('09').slice(0, 14),
  UNI: ethers.utils.formatBytes32String('10').slice(0, 14),
  MKR: ethers.utils.formatBytes32String('11').slice(0, 14),
  FDAI2203: ethers.utils.formatBytes32String('12').slice(0, 14),
  FUSDC2203: ethers.utils.formatBytes32String('13').slice(0, 14),
  FDAI2206: ethers.utils.formatBytes32String('14').slice(0, 14),
  FUSDC2206: ethers.utils.formatBytes32String('15').slice(0, 14),
  FDAI2209: ethers.utils.formatBytes32String('16').slice(0, 14),
  FUSDC2209: ethers.utils.formatBytes32String('17').slice(0, 14),
  FRAX: ethers.utils.formatBytes32String('18').slice(0, 14),
  CVX3CRV: ethers.utils.formatBytes32String('19').slice(0, 14),
  EWETH: ethers.utils.formatBytes32String('20').slice(0, 14),
  EDAI: ethers.utils.formatBytes32String('21').slice(0, 14),
  EUSDC: ethers.utils.formatBytes32String('22').slice(0, 14),
  EFRAX: ethers.utils.formatBytes32String('23').slice(0, 14),
}

//     CHAINLINK: 'chainlinkOracle'
//     CHAINLINKUSD: 'chainlinkUSDOracle'
//     ACCUMULATOR: 'accumulatorOracle'
//     COMPOUND: 'compoundOracle'
//     COMPOSITE: 'compositeOracle'
//     LIDO: 'lidoOracle'
//     UNISWAP: 'uniswapOracle'
//     CONVEX3CRV: 'cvx3CrvOracle'
//     YEARN: 'yearnOracle'
//     NOTIONAL: 'notionalOracle'
//     IDENTITY: 'identityOracle'

//     EODEC21: 1640919600 // Friday, Dec 31, 2021 3:00:00 AM GMT+00:00
//     EOMAR22: 1648177200 // Friday, Mar 25, 2022 3:00:00 AM GMT+00:00
//     EOJUN22: 1656039600 // Friday, Jun 24, 2022 3:00:00 PM GMT+00:00
//     EOSEP22: 1664550000 // Friday, Sep 30 2022 15:00:00 GMT+0000
//     EODEC22: 1672412400 // Friday, Dec 30 2022 15:00:00 GMT+0000
//     EOMAR23: 1680271200 // Friday, Mar 31 2023 14:00:00 GMT+0000

//     FCASH_MAR22: 1648512000 // 212 * (86400 * 90)
//     FCASH_JUN22: 1656288000 // 213 * (86400 * 90)
//     FCASH_SEP22: 1664064000 // 214 * (86400 * 90)
//     FCASH_DEC22: 1671840000 // 215 * (86400 * 90)
//     FCASH_MAR23: 1679616000 // 216 * (86400 * 90)
//     FCASH_DAI: '2'
//     FCASH_USDC: '3'

//     // CurrencyId*(16**12)+Maturity*(16**2)+1: 563371972493313
//     FDAI2203ID: 563371972493313
//     FDAI2206ID: 563373963149313
//     FDAI2209ID: 563375953805313
//     FDAI2212ID: 563377944461313
//     FDAI2303ID: 563380102848513
//     FUSDC2203ID: 844846949203969
//     FUSDC2206ID: 844848939859969
//     FUSDC2209ID: 844850930515969
//     FUSDC2212ID: 844852921171969
//     FUSDC2303ID: 844855079559169

export const seriesIds = {
  // Note: The first two digits are the borrowable asset, the second two are the quarters since Q1 2021
  FYETH2203: ethers.utils.formatBytes32String('0005').slice(0, 14), // End of 5th quarter from 1st January 2021
  FYETH2206: ethers.utils.formatBytes32String('0006').slice(0, 14), // End of 6th quarter from 1st January 2021
  FYETH2209: ethers.utils.formatBytes32String('0007').slice(0, 14),
  FYETH2212: ethers.utils.formatBytes32String('0008').slice(0, 14),
  FYETH2303: ethers.utils.formatBytes32String('0009').slice(0, 14),
  FYDAI2112: ethers.utils.formatBytes32String('0104').slice(0, 14),
  FYDAI2203: ethers.utils.formatBytes32String('0105').slice(0, 14),
  FYDAI2206: ethers.utils.formatBytes32String('0106').slice(0, 14),
  FYDAI2209: ethers.utils.formatBytes32String('0107').slice(0, 14),
  FYDAI2212: ethers.utils.formatBytes32String('0108').slice(0, 14),
  FYDAI2303: ethers.utils.formatBytes32String('0109').slice(0, 14),
  FYUSDC2112: ethers.utils.formatBytes32String('0204').slice(0, 14),
  FYUSDC2203: ethers.utils.formatBytes32String('0205').slice(0, 14),
  FYUSDC2206: ethers.utils.formatBytes32String('0206').slice(0, 14),
  FYUSDC2209: ethers.utils.formatBytes32String('0207').slice(0, 14),
  FYUSDC2212: ethers.utils.formatBytes32String('0208').slice(0, 14),
  FYUSDC2303: ethers.utils.formatBytes32String('0209').slice(0, 14),
  FYFRAX2206: ethers.utils.formatBytes32String('0306').slice(0, 14), // Incorrectly labelled
  FYFRAX2209: ethers.utils.formatBytes32String('0307').slice(0, 14), // Incorrectly labelled
  FYFRAX2212: ethers.utils.formatBytes32String('1808').slice(0, 14),
  FYFRAX2303: ethers.utils.formatBytes32String('1809').slice(0, 14),
}
//     YSDAI6MMS: 'YSDAI6MMS' // Yield Strategy DAI 6M Mar Sep
//     YSDAI6MJD: 'YSDAI6MJD' // Yield Strategy DAI 6M Jun Dec
//     YSUSDC6MMS: 'YSUSDC6MMS' // Yield Strategy USDC 6M Mar Sep
//     YSUSDC6MJD: 'YSUSDC6MJD' // Yield Strategy USDC 6M Jun Dec
//     YSETH6MMS: 'YSETH6MMS' // Yield Strategy ETH 6M Mar Sep
//     YSETH6MJD: 'YSETH6MJD' // Yield Strategy ETH 6M Jun Dec
//     YSFRAX6MMS: 'YSFRAX6MMS' // Yield Strategy FRAX 6M Mar Sep
//     YSFRAX6MJD: 'YSFRAX6MJD' // Yield Strategy FRAX 6M Jun Dec

//     ONE64: BigNumber.from('18446744073709551616') // In 64.64 format
//     secondsInOneYear: BigNumber.from(31557600)
//     secondsInTenYears: secondsInOneYear.mul(10) // Seconds in 10 years
//     secondsIn25Years: secondsInOneYear.mul(25) // Seconds in 25 years
//     secondsIn30Years: secondsInOneYear.mul(30) // Seconds in 30 years
//     secondsIn40Years: secondsInOneYear.mul(40) // Seconds in 40 years
//     ts: ONE64.div(secondsIn25Years)

//     g0: ONE64 // No fees
//     g1: ONE64.mul(950).div(1000) // Sell base to the pool
//     g2: ONE64.mul(1000).div(950) // Sell fyToken to the pool

//     CHI: ethers.utils.formatBytes32String('CHI').slice(0, 14)
//     RATE: ethers.utils.formatBytes32String('RATE').slice(0, 14)
//     G1: ethers.utils.formatBytes32String('g1')
//     G2: ethers.utils.formatBytes32String('g2')
//     TS: ethers.utils.formatBytes32String('ts')

//     // JSON file keys
//     contangoWitch_key: 'contangoWitch'
//     contangoCauldron_key: 'contangoCauldron'
//     contangoLadle_key: 'contangoLadle'
//     contangoLadleRouter_key: 'contangoLadleRouter'
// }

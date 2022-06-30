import { ethers } from 'hardhat'
import { jsonToMap, readAddressMappingIfExists, impersonate, getOriginalChainId } from '../../../../../shared/helpers'
// import { WAD, DAI, FYDAI2212 } from '../../../../../shared/constants'
import { ERC20Mock, Pool, FYToken } from '../../../../../typechain'
import { whales, poolsInit, joins } from '../addDecSeries/addDecSeries.mainnet.config'
import { BigNumber } from 'ethers'
import {
  ZERO,
  ZERO_ADDRESS,
  WAD,
  ONEUSDC,
  MAX256,
  ONE64,
  secondsIn25Years,
  secondsInOneYear,
} from '../../../../../shared/constants'

import * as fs from 'fs'
/**
 * @dev This script sells FYToken
 */
;(async () => {
  console.log(ONE64.div(secondsInOneYear.mul(25)).toString())

  // const chainId = await getOriginalChainId()
  // const governance = readAddressMappingIfExists('governance.json')
  // const whaleAcc = await impersonate(whales.get(DAI) as string, WAD)
  // const pools = readAddressMappingIfExists('newPools.json')
  // const poolAddress = pools.get(FYDAI2212) as string
  // const pool = (await ethers.getContractAt('Pool', poolAddress, whaleAcc)) as Pool
  // const baseAddress = await pool.base()
  // // console.log("baseAddress", baseAddress);
  // const base = (await ethers.getContractAt('ERC20Mock', baseAddress, whaleAcc)) as unknown as ERC20Mock
  // const joinAddress = joins.get(DAI) as string
  // var baseWhale = await base.balanceOf(whaleAcc.address)

  // var baseJoin = await base.balanceOf(joinAddress)
  // // await base.connect(whaleAcc).transfer(joinAddress as string, WAD.mul(100_000))
  // baseJoin = await base.balanceOf(joinAddress)
  // const fyTokens = jsonToMap(fs.readFileSync('./addresses/localhost/newFYTokens.json', 'utf8')) as Map<string, string>
  // const fyTokenAddress = fyTokens.get(FYDAI2212) as string
  // const fyToken = (await ethers.getContractAt('FYToken', fyTokenAddress, whaleAcc)) as FYToken
  // var baseFYToken = await base.balanceOf(fyTokenAddress)
  // var fyTokenWhale = await fyToken.balanceOf(whaleAcc.address)
  // var fyTokenPool = await fyToken.balanceOf(poolAddress)
  // console.log('fyTokenPool', fyTokenPool)
  // var cached: any = await pool.getCache()
  // console.log(cached[0])
  // console.log(cached[1])
  // console.log(cached[2])
  // console.log(cached[3])

  // // mint fytoken to pool
  // console.log('fyTokenWhale', fyTokenWhale)
  // // await fyToken.connect(whaleAcc).mintWithUnderlying(poolAddress, WAD.mul(10_000))
  // fyTokenPool = await fyToken.balanceOf(poolAddress)
  // console.log('fyTokenPool', fyTokenPool)

  // baseFYToken = await base.balanceOf(fyTokenAddress)
  // console.log('baseFYToken', baseFYToken)
  // fyTokenWhale = await fyToken.balanceOf(whaleAcc.address)
  // console.log('fyTokenWhale', fyTokenWhale)
  // var poolWhale = await pool.balanceOf(whaleAcc.address)
  // console.log('poolWhale', poolWhale)

  // // sell fytoken
  // // await pool.connect(whaleAcc).sellFYToken(whaleAcc.address as string, 0)
  // poolWhale = await pool.balanceOf(whaleAcc.address)
  // console.log('poolWhale', poolWhale)
  // fyTokenPool = await fyToken.balanceOf(poolAddress)
  // console.log('fyTokenPool', fyTokenPool)

  // // buyFYToken
  // await base.connect(whaleAcc).transfer(pool.address as string, WAD.mul(50_000))
  // await pool.connect(whaleAcc).sellBase(whaleAcc.address as string, 0)
  // poolWhale = await pool.balanceOf(whaleAcc.address)
  // console.log('poolWhale', poolWhale)
  // fyTokenPool = await fyToken.balanceOf(poolAddress)
  // console.log('fyTokenPool', fyTokenPool)

  // // // retrieve FYToken
  // // fyTokenWhale = await fyToken.balanceOf(whaleAcc.address)
  // // console.log("fyTokenWhale", fyTokenWhale);
  // // await pool.connect(whaleAcc).retrieveFYToken(whaleAcc.address);
  // // fyTokenWhale = await fyToken.balanceOf(whaleAcc.address)
  // // console.log("fyTokenWhale", fyTokenWhale);

  // // buyBasePreview
  // const bbp = await pool.ts();
  // console.log(bbp)
})()

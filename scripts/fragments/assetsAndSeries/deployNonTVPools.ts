import { network, ethers, waffle } from 'hardhat'
import { BigNumber } from 'ethers'
import { verify } from '../../../shared/helpers'

import { Pool, Timelock, YieldMath } from '../../../typechain'

import { ROOT } from '../../../shared/constants'

/**
 * @dev This script deploys a number of Pools
 */

export const deployNonTVPools = async (
  ownerAcc: any,
  timelock: Timelock,
  yieldMathLibrary: YieldMath,
  poolData: Array<[string, string, string, BigNumber, number]>
): Promise<Map<string, Pool>> => {
  const PoolNonTvFactory = await ethers.getContractFactory(
    '@yield-protocol/yieldspace-tv/src/Pool/Modules/PoolNonTv.sol:PoolNonTv',
    {
      libraries: {
        YieldMath: yieldMathLibrary.address,
      },
    }
  )

  let pools: Map<string, Pool> = new Map()
  for (let [seriesId, baseAddress, fyTokenAddress, ts, g1] of poolData) {
    console.log()
    console.log('******************************')
    console.log('Deploying NonTv pool for seriesID: ', seriesId)
    if ((await ethers.provider.getCode(baseAddress)) === '0x') throw `Contract at ${baseAddress} contains no code`
    else console.log(`Using base at ${baseAddress}`)

    if ((await ethers.provider.getCode(fyTokenAddress)) === '0x') throw `Contract at ${fyTokenAddress} contains no code`
    else console.log(`Using fyToken at ${fyTokenAddress}`)

    console.log('Deploy args:')
    console.log(baseAddress, fyTokenAddress, ts, g1)
    const pool = (await PoolNonTvFactory.deploy(baseAddress, fyTokenAddress, ts, g1)) as unknown as Pool
    pools.set(seriesId, pool)
    console.log(`Pool deployed at ${pool.address}`)
    verify(pool.address, [baseAddress, fyTokenAddress, ts.toString(), g1.toString()], 'YieldMath.js')
    if (!(await pool.hasRole(ROOT, timelock.address))) {
      await pool.grantRole(ROOT, timelock.address)
      console.log(`pool.grantRoles(ROOT, timelock)`)
      while (!(await pool.hasRole(ROOT, timelock.address))) {}
    }
  }
  return pools
}

import { ethers, waffle } from 'hardhat'
import { BigNumber } from 'ethers'
import { verify } from '../../../shared/helpers'

import { Pool, YieldMath } from '../../../typechain'

/**
 * @dev This script deploys a number of Pools
 */

export const deployPools = async (
  ownerAcc: any,
  yieldMathLibrary: YieldMath,
  poolData: Array<[string, string, string, BigNumber, BigNumber]>
): Promise<Map<string, Pool>> => {
  const PoolFactory = await ethers.getContractFactory('@yield-protocol/yieldspace-tv/src/Pool/Pool.sol:Pool', {
    libraries: {
      YieldMath: yieldMathLibrary.address,
    },
  })

  let pools: Map<string, Pool> = new Map()
  for (let [seriesId, baseAddress, fyTokenAddress, ts, g1] of poolData) {
    if ((await ethers.provider.getCode(baseAddress)) === '0x') throw `Contract at ${baseAddress} contains no code`
    else console.log(`Using base at ${baseAddress}`)

    if ((await ethers.provider.getCode(fyTokenAddress)) === '0x') throw `Contract at ${fyTokenAddress} contains no code`
    else console.log(`Using fyToken at ${fyTokenAddress}`)

    const pool = (await PoolFactory.deploy(baseAddress, fyTokenAddress, ts, g1)) as unknown as Pool
    console.log(`Pool deployed at ${pool.address}`)
    verify(pool.address, [baseAddress, fyTokenAddress, ts.toString(), g1.toString()], 'YieldMath.js')

    pools.set(seriesId, pool)
  }

  return pools
}

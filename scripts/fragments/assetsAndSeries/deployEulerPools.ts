import { network, ethers, waffle } from 'hardhat'
import { BigNumber } from 'ethers'
import { verify } from '../../../shared/helpers'

import { Pool, Timelock, YieldMath } from '../../../typechain'

import { ROOT } from '../../../shared/constants'

/**
 * @dev This script deploys a number of Pools
 */

export const deployEulerPools = async (
  ownerAcc: any,
  timelock: Timelock,
  yieldMathLibrary: YieldMath,
  poolData: Array<[string, string, string, string, BigNumber, number]>
): Promise<Map<string, Pool>> => {
  const PoolEulerFactory = await ethers.getContractFactory(
    '@yield-protocol/yieldspace-tv/src/Pool/Modules/PoolEuler.sol:PoolEuler',
    {
      libraries: {
        YieldMath: yieldMathLibrary.address,
      },
    }
  )

  let pools: Map<string, Pool> = new Map()
  for (let [seriesId, eulerAddress, sharesToken, fyTokenAddress, ts, g1] of poolData) {
    console.log()
    console.log('******************************')
    console.log('Deploying Euler pool for seriesID: ', seriesId)
    if ((await ethers.provider.getCode(eulerAddress)) === '0x') throw `Contract at ${eulerAddress} contains no code`
    else console.log(`Using main Euler contract at ${eulerAddress}`)

    if ((await ethers.provider.getCode(sharesToken)) === '0x') throw `Contract at ${sharesToken} contains no code`
    else console.log(`Using sharesToken at ${sharesToken}`)

    if ((await ethers.provider.getCode(fyTokenAddress)) === '0x') throw `Contract at ${fyTokenAddress} contains no code`
    else console.log(`Using fyToken at ${fyTokenAddress}`)

    console.log('Deploy args:')
    console.log(eulerAddress, sharesToken, fyTokenAddress, ts, g1)

    const pool = (await PoolEulerFactory.deploy(eulerAddress, sharesToken, fyTokenAddress, ts, g1)) as unknown as Pool
    console.log(`Pool deployed at ${pool.address}`)
    verify(pool.address, [eulerAddress, sharesToken, fyTokenAddress, ts.toString(), g1.toString()], 'YieldMath.js')
    if (!(await pool.hasRole(ROOT, timelock.address))) {
      await pool.grantRole(ROOT, timelock.address)
      console.log(`pool.grantRoles(ROOT, timelock)`)
      while (!(await pool.hasRole(ROOT, timelock.address))) {}
    }

    pools.set(seriesId, pool)
  }
  return pools
}

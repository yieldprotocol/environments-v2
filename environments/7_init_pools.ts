import { ethers, waffle } from 'hardhat'

import *  as fs from 'fs'

import { jsonToMap } from '../shared/helpers'
import { WAD } from '../shared/constants'

import { id } from '@yield-protocol/utils-v2'

import { Pool } from '../typechain/Pool'
import { ERC20Mock } from '../typechain/ERC20Mock'
import { FYToken } from '../typechain/FYToken'

 /**
 * This script initiates the pools
 * 
 * run:
 * npx hardhat run ./environments/series.ts --network localhost
 *
 */

const pools = jsonToMap(fs.readFileSync('./output/pools.json', 'utf8')) as Map<string,string>;

console.time("Pools initialized");

(async () => {
    const [ ownerAcc ] = await ethers.getSigners();
    for (let poolAddress of pools.values()) {
      const _pool: Pool = await ethers.getContractAt('Pool', poolAddress, ownerAcc) as Pool

      const base: ERC20Mock  = await ethers.getContractAt('ERC20Mock', await _pool.base(), ownerAcc) as ERC20Mock
      const fyToken: FYToken = await ethers.getContractAt('FYToken', await _pool.fyToken(), ownerAcc) as FYToken

      // Supply pool with a million tokens of each for initialization
      // try {
        // try minting tokens (as the token owner for mock tokens)
        await base.mint(poolAddress, WAD.mul(1000000)); console.log(`base.mint(pool.address)`)
      /* } catch (e) { 
        // if that doesn't work, try transfering tokens from a whale/funder account
        // await transferFromFunder( base.address, pool.address, WAD.mul(1000000), funder)
        console.log(e);
      }*/
      // Initialize pool
      await _pool.mint(await ownerAcc.getAddress(), true, 0); console.log(`pool.mint(owner)`)
  
      // Donate fyToken to the pool to skew it
      await fyToken.grantRole(id('mint(address,uint256)'), await ownerAcc.getAddress()); console.log(`fyToken.grantRoles(owner)`)

      await fyToken.mint(poolAddress, WAD.mul(1000000).div(9)); console.log(`fyToken.mint(pool.address)`)
      await _pool.sync(); console.log(`pool.sync`)  
    }

    console.timeEnd("Pools initialized")
})()

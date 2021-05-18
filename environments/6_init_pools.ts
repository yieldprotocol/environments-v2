import { ethers, waffle } from 'hardhat'
import { WAD } from '../shared/constants'
import { id } from '@yield-protocol/utils-v2'

import { Pool } from '../typechain/Pool'
import { ERC20Mock } from '../typechain/ERC20Mock'
import { FYToken } from '../typechain/FYToken'

import { transferFromFunder } from '../shared/helpers';

/**
 * 
 * README
 * 
 * 
 */
const poolAddresses = [
  ['DAI1Pool', '0x69f9C1D1B2d0F90Cb60C461555267D182b6389ac'],
  ['DAI2Pool', '0xff52234137A0752fb077e6b3A2838719Ee891874'],
  ['USDC1Pool', '0xE29694371Bf0149C7745af3A937570aCb29Fc17a'],
  ['USDC2Pool', '0xBAD1A3e3AD1a22543cd17EE8dbD05fD3c1BC414a'],
]

 /**
 * 
 * run:
 * npx hardhat run ./environments/development.ts --network localhost
 *
 */

console.time("Pools initialized");

(async () => {
    const [ ownerAcc ] = await ethers.getSigners();    

    for (let [seriesId, poolAddress] of poolAddresses) {
        const pool = (await ethers.getContractAt('Pool', poolAddress, ownerAcc) as unknown) as Pool
        const base = (await ethers.getContractAt('ERC20Mock', await pool.base(), ownerAcc) as unknown) as ERC20Mock
        const fyToken = (await ethers.getContractAt('FYToken', await pool.fyToken(), ownerAcc) as unknown) as FYToken

        // Supply pool with a million tokens of each for initialization
        try {
          // try minting tokens (as the token owner for mock tokens)
          await base.mint(pool.address, WAD.mul(1000000)); console.log(`base.mint(pool.address)`)
        } catch (e) { 
          // if that doesn't work, try transfering tokens from a whale/funder account
          // await transferFromFunder( base.address, pool.address, WAD.mul(1000000), funder)
        }
        // Initialize pool
        await pool.mint(await ownerAcc.getAddress(), true, 0); console.log(`pool.mint(owner)`)
    
        // Donate fyToken to the pool to skew it
        await fyToken.grantRole(id('mint(address,uint256)'), await ownerAcc.getAddress()); console.log(`fyToken.grantRoles(owner)`)
  
        await fyToken.mint(pool.address, WAD.mul(1000000).div(9)); console.log(`fyToken.mint(pool.address)`)
        await pool.sync(); console.log(`pool.sync`)            
    }

    
    console.timeEnd("Pools initialized")
})()
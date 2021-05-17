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
    '0x61F57002B39f3D18E1D270b8299473b028C95d45',
    '0xdc7d93317AA13e631b9Bf7008Aa2f413eD5D689A',
    '0xF58dd46665e9FcaAf657b3Bee7367065Ee0ab61C',
    '0xde588C4c822C907d21508D9911b354b29dc59C2a',
]

 /**
 * 
 * run:
 * npx hardhat run ./environments/development.ts --network localhost
 *
 */

console.time("Assets added in");

(async () => {
    const [ ownerAcc ] = await ethers.getSigners();    

    for (let poolAddress of poolAddresses) {
        const pool = (await ethers.getContractAt('Pool', poolAddress, ownerAcc) as unknown) as Pool
        const base = (await ethers.getContractAt('ERC20Mock', await pool.baseToken(), ownerAcc) as unknown) as ERC20Mock
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

    
    console.timeEnd("Assets added in")
})()
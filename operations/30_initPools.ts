/**
 * @dev This script initializes pools in the protocol.
 * 
 * It takes as inputs the governance and pools json address files.
 */

import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { id } from '@yield-protocol/utils-v2'
import { jsonToMap, stringToBytes6 } from '../shared/helpers'
import { WAD } from '../shared/constants'

import { ERC20Mock } from '../typechain/ERC20Mock'
import { FYToken } from '../typechain/FYToken'
import { Pool } from '../typechain/Pool'


import { Timelock } from '../typechain/Timelock'

(async () => {
  // Input data
  const poolsInit: Array<[string]> = [ // [seriesId]
    [stringToBytes6('DAI07')],
    [stringToBytes6('DAI08')],
  ]

  const [ ownerAcc ] = await ethers.getSigners();
  const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string, string>;
  const pools = jsonToMap(fs.readFileSync('./output/pools.json', 'utf8')) as Map<string, string>;

  // Contract instantiation
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc) as unknown as Timelock

  // Build the proposal
  const proposal : Array<{ target: string; data: string }> = []

  for (let [poolId] of poolsInit) {
    const poolAddress = pools.get(poolId) as string
    const pool: Pool = await ethers.getContractAt('Pool', poolAddress, ownerAcc) as Pool

    const base: ERC20Mock  = await ethers.getContractAt('ERC20Mock', await pool.base(), ownerAcc) as ERC20Mock
    const fyToken: FYToken = await ethers.getContractAt('FYToken', await pool.fyToken(), ownerAcc) as FYToken

    // Supply pool with a million tokens of underlying for initialization
    proposal.push({
      target: base.address,
      data: base.interface.encodeFunctionData("mint", [poolAddress, WAD.mul(1000000)])
    })

    // Initialize pool
    proposal.push({
      target: pool.address,
      data: pool.interface.encodeFunctionData("mint", [ownerAcc.address, true, 0])
    })

    // Give to the timelock permission to mint fyToken out of thin air (only test!)
    // The timelock created the series through the Wand, so it got ROOT access to the fyTokens at that point
    proposal.push({
      target: fyToken.address,
      data: fyToken.interface.encodeFunctionData("grantRole", [id(fyToken.interface, 'mint(address,uint256)'), timelock.address])
    })

    // Donate fyToken to the pool to skew it
    proposal.push({
      target: fyToken.address,
      data: fyToken.interface.encodeFunctionData("mint", [poolAddress, WAD.mul(1000000).div(9)])
    })

    // Sync the pool
    proposal.push({
      target: pool.address,
      data: pool.interface.encodeFunctionData("sync")
    })

    console.log(`Queued init of ${await pool.symbol()}`)
  }
  // Propose, update, execute
  const txHash = await timelock.callStatic.propose(proposal)
  await timelock.propose(proposal); console.log(`Proposed ${txHash}`)
  await timelock.approve(txHash); console.log(`Approved ${txHash}`)
  await timelock.execute(proposal); console.log(`Executed ${txHash}`)
})()
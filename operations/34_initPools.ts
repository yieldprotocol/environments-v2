/**
 * @dev This script initializes pools in the protocol.
 * 
 * It takes as inputs the governance and pools json address files.
 */

import { ethers } from 'hardhat'
import *  as fs from 'fs'
import *  as hre from 'hardhat'
import { id } from '@yield-protocol/utils-v2'
import { BigNumber } from 'ethers'
import { jsonToMap, stringToBytes6 } from '../shared/helpers'
import { WAD, ZERO_ADDRESS } from '../shared/constants'

import { ERC20Mock } from '../typechain/ERC20Mock'
import { FYToken } from '../typechain/FYToken'
import { Pool } from '../typechain/Pool'

import { Timelock } from '../typechain/Timelock'
import { Relay } from '../typechain/Relay'

(async () => {
  // Input data
  const poolsInit: Array<[string]> = [ // [seriesId]
//    [stringToBytes6('0103')],
//    [stringToBytes6('0104')],
//    [stringToBytes6('0203')],
//    [stringToBytes6('0204')],
//    [stringToBytes6('0220')],
//    [stringToBytes6('0221')],
//    [stringToBytes6('0222')],
//    [stringToBytes6('0223')],
    [stringToBytes6('0224')],
  ]

  /* await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: ["0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5"],
  });
  const ownerAcc = await ethers.getSigner("0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5") */
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
    const baseUnit: BigNumber = BigNumber.from(10).pow(await base.decimals())

    // Supply pool with a hundred tokens of underlying for initialization
    proposal.push({
      target: base.address,
      data: base.interface.encodeFunctionData("mint", [poolAddress, baseUnit.mul(100)])
    })

    // Initialize pool
    proposal.push({
      target: pool.address,
      data: pool.interface.encodeFunctionData("mint", [ZERO_ADDRESS, true, 0])  // Send the LP tokens to the zero address
    })

    // Give to the timelock permission to mint fyToken out of thin air (only test!)
    // The timelock created the series through the Wand, so it got ROOT access to the fyTokens at that point
    /* proposal.push({
      target: fyToken.address,
      data: fyToken.interface.encodeFunctionData("grantRole", [id(fyToken.interface, 'mint(address,uint256)'), timelock.address])
    }) */

    // Donate fyToken to the pool to skew it
    /* proposal.push({
      target: fyToken.address,
      data: fyToken.interface.encodeFunctionData("mint", [poolAddress, baseUnit.mul(100).div(9)])
    }) */

    // Sync the pool
    /* proposal.push({
      target: pool.address,
      data: pool.interface.encodeFunctionData("sync")
    }) */
    console.log(`Initalizing ${await pool.symbol()} at ${poolAddress}`)
  }

  // Propose, approve, execute
  const txHash = await timelock.hash(proposal); console.log(`Proposal: ${txHash}`)
  if ((await timelock.proposals(txHash)).state === 0) { 
    await timelock.propose(proposal); console.log(`Queued proposal for ${txHash}`) 
    while ((await timelock.proposals(txHash)).state < 1) { }; console.log(`Proposed ${txHash}`) 
  }
  if ((await timelock.proposals(txHash)).state === 1) {
    await timelock.approve(txHash); console.log(`Queued approval for ${txHash}`)
    while ((await timelock.proposals(txHash)).state < 2) { }; console.log(`Approved ${txHash}`)
  }
  if ((await timelock.proposals(txHash)).state === 2) { 
    await timelock.execute(proposal); console.log(`Queued execution for ${txHash}`) 
    while ((await timelock.proposals(txHash)).state > 0) { }; console.log(`Executed ${txHash}`) 
  }
})()
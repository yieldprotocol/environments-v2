/**
 * @dev This script initializes pools in the protocol.
 *
 * It takes as inputs the governance and pools json address files.
 */

import { ethers } from 'hardhat'
import * as fs from 'fs'
import * as hre from 'hardhat'
import { id } from '@yield-protocol/utils-v2'
import { BigNumber } from 'ethers'
import { jsonToMap, stringToBytes6 } from '../../shared/helpers'
import { WAD, ZERO_ADDRESS } from '../../shared/constants'

import { ERC20Mock } from '../../typechain/ERC20Mock'
import { FYToken } from '../../typechain/FYToken'
import { Pool } from '../../typechain/Pool'

import { Timelock } from '../../typechain/Timelock'
import { Relay } from '../../typechain/Relay'

;(async () => {
  // Input data
  const poolsInit: Array<[string]> = [
    // [seriesId]
    [stringToBytes6('0104')],
    [stringToBytes6('0105')],
    [stringToBytes6('0204')],
    [stringToBytes6('0205')],
  ]

  /* await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: ["0xA072f81Fea73Ca932aB2B5Eda31Fa29306D58708"],
  });
  const ownerAcc = await ethers.getSigner("0xA072f81Fea73Ca932aB2B5Eda31Fa29306D58708") */
  const [ownerAcc] = await ethers.getSigners()

  const governance = jsonToMap(fs.readFileSync('./addresses/governance.json', 'utf8')) as Map<string, string>
  const pools = jsonToMap(fs.readFileSync('./addresses/pools.json', 'utf8')) as Map<string, string>

  // Contract instantiation
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []

  for (let [poolId] of poolsInit) {
    const poolAddress = pools.get(poolId) as string
    const pool: Pool = (await ethers.getContractAt('Pool', poolAddress, ownerAcc)) as Pool

    const base: ERC20Mock = (await ethers.getContractAt('ERC20Mock', await pool.base(), ownerAcc)) as ERC20Mock
    const baseUnit: BigNumber = BigNumber.from(10).pow(await base.decimals())

    // Supply pool with a hundred tokens of underlying for initialization
    proposal.push({
      target: base.address,
      data: base.interface.encodeFunctionData('transfer', [poolAddress, baseUnit.mul(100)]),
    })

    // Initialize pool
    proposal.push({
      target: pool.address,
      data: pool.interface.encodeFunctionData('mint', [ZERO_ADDRESS, ZERO_ADDRESS, 0, 0]), // Send the LP tokens to the zero address, maxRatio is set to zero, purposefully reverting this if someone has already initialized the pool
    })
    console.log(`Initalizing ${await pool.symbol()} at ${poolAddress}`)
  }

  // Propose, approve, execute
  const txHash = await timelock.hash(proposal)
  console.log(`Proposal: ${txHash}`)
  if ((await timelock.proposals(txHash)).state === 0) {
    await timelock.propose(proposal)
    while ((await timelock.proposals(txHash)).state < 1) {}
    console.log(`Proposed ${txHash}`)
  }
  if ((await timelock.proposals(txHash)).state === 1) {
    await timelock.approve(txHash)
    while ((await timelock.proposals(txHash)).state < 2) {}
    console.log(`Approved ${txHash}`)
  }
  if ((await timelock.proposals(txHash)).state === 2) {
    await timelock.execute(proposal)
    while ((await timelock.proposals(txHash)).state > 0) {}
    console.log(`Executed ${txHash}`)
  }
})()

/**
 * @dev This script initializes strategies in the protocol.
 * 
 * It takes as inputs the governance and protocol json address files.
 */

import { ethers } from 'hardhat'
import *  as fs from 'fs'
import *  as hre from 'hardhat'
import { jsonToMap, bytesToString, stringToBytes6 } from '../shared/helpers'
import { ZERO_ADDRESS } from '../shared/constants'
import { BigNumber } from 'ethers'

import { ERC20Mock } from '../typechain/ERC20Mock'
import { Strategy } from '../typechain/Strategy'
import { Ladle } from '../typechain/Ladle'
import { Timelock } from '../typechain/Timelock'
import { Relay } from '../typechain/Relay'

(async () => {
  // Input data
  const strategiesInit: Array<[string, [string, string], [string, string]]> = [ // [strategyId, [startPoolId, startSeriesId],[nextPoolId,nextSeriesId]]
//    ['DAIQ1', [stringToBytes6('0103'), stringToBytes6('0103')],[stringToBytes6('0105'), stringToBytes6('0105')]], // poolId and seriesId usually match
//    ['DAIQ2', [stringToBytes6('0104'), stringToBytes6('0104')],[stringToBytes6('0106'), stringToBytes6('0106')]], // poolId and seriesId usually match
//    ['USDCQ1', [stringToBytes6('0203'), stringToBytes6('0203')],[stringToBytes6('0205'), stringToBytes6('0205')]],
//    ['USDCQ2', [stringToBytes6('0204'), stringToBytes6('0204')],[stringToBytes6('0206'), stringToBytes6('0206')]],
    ['USDCD1', [stringToBytes6('0220'), stringToBytes6('0220')],[stringToBytes6('0221'), stringToBytes6('0221')]],
  ]
  
  /* await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: ["0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5"],
  });
  const ownerAcc = await ethers.getSigner("0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5") */
  const [ ownerAcc ] = await ethers.getSigners();
  const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string, string>;
  const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string, string>;
  const pools = jsonToMap(fs.readFileSync('./output/pools.json', 'utf8')) as Map<string, string>;
  const strategies = jsonToMap(fs.readFileSync('./output/strategies.json', 'utf8')) as Map<string, string>;

  // Contract instantiation
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc) as unknown as Timelock

  // Build the proposal
  const proposal : Array<{ target: string; data: string }> = []

  for (let [strategyId, [startPoolId, startSeriesId], [nextPoolId, nextSeriesId]] of strategiesInit) {
    const strategy: Strategy = await ethers.getContractAt('Strategy', strategies.get(strategyId) as string, ownerAcc) as Strategy
    const ladle: Ladle = await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc) as Ladle
    const base: ERC20Mock  = await ethers.getContractAt('ERC20Mock', await strategy.base(), ownerAcc) as ERC20Mock
    const baseUnit: BigNumber = BigNumber.from(10).pow(await base.decimals())

    /* proposal.push(
      {
        target: strategy.address,
        data: strategy.interface.encodeFunctionData("setNextPool", [pools.get(startPoolId) as string, startSeriesId])
      }
    )
    proposal.push(
      {
        target: base.address,
        data: base.interface.encodeFunctionData("mint", [strategy.address, BigNumber.from(100).mul(baseUnit)])
      },
    )
    proposal.push(
      {
        target: strategy.address,
        data: strategy.interface.encodeFunctionData("startPool")
      }
    )
    proposal.push(
      {
        target: strategy.address,
        data: strategy.interface.encodeFunctionData("transfer", [ZERO_ADDRESS, BigNumber.from(100).mul(baseUnit)])  // Burn the strategy tokens minted
      },
    ) */
    proposal.push(
      {
        target: strategy.address,
        data: strategy.interface.encodeFunctionData("setNextPool", [pools.get(nextPoolId) as string, nextSeriesId])
      },
    )
    /* proposal.push(
      {
        target: ladle.address,
        data: ladle.interface.encodeFunctionData("addIntegration", [strategy.address, true])
      },
    )
    proposal.push(
      {
        target: ladle.address,
        data: ladle.interface.encodeFunctionData("addToken", [strategy.address, true])
      },
    ) */
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
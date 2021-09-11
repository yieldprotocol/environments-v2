/**
 * @dev This script rolls strategies in the protocol.
 * 
 * It takes as inputs the governance json address file.
 */

import { ethers } from 'hardhat'
import *  as fs from 'fs'
import *  as hre from 'hardhat'
import { jsonToMap, bytesToString, stringToBytes6 } from '../shared/helpers'

import { Strategy } from '../typechain/Strategy'
import { Timelock } from '../typechain/Timelock'
import { Relay } from '../typechain/Relay'

import { ERC20Mock } from '../typechain/ERC20Mock'
import { Pool } from '../typechain/Pool'
import { FYToken } from '../typechain/FYToken'
import { Cauldron } from '../typechain/Cauldron'
import { Join } from '../typechain/Join'

(async () => {
  // Input data
  const strategiesRoll: Array<[string, [string, string]]> = [ // [strategyId, [nextPoolId,nextSeriesId]]
//    ['DAI2S', [stringToBytes6('DAI21'), stringToBytes6('DAI21')],[stringToBytes6('DAI22'), stringToBytes6('DAI22')]], // poolId and seriesId usually match
//    ['USDC2S', [stringToBytes6('USDC21'), stringToBytes6('USDC21')],[stringToBytes6('USDC22'), stringToBytes6('USDC22')]],
//    ['USDT2S', [stringToBytes6('USDT21'), stringToBytes6('USDT21')],[stringToBytes6('USDT22'), stringToBytes6('USDT22')]]
    ['USDCSD', [stringToBytes6('USDC12'), stringToBytes6('USDC12')]]

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
  const relay = await ethers.getContractAt('Relay', governance.get('relay') as string, ownerAcc) as unknown as Relay

  // Build the proposal
  const proposal : Array<{ target: string; data: string }> = []

  for (let [strategyId, [nextPoolId, nextSeriesId]] of strategiesRoll) {
    const strategy = await ethers.getContractAt('Strategy', strategies.get(strategyId) as string, ownerAcc) as Strategy

    proposal.push(
      {
        target: strategy.address,
        data: strategy.interface.encodeFunctionData("endPool")
      }
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
        data: strategy.interface.encodeFunctionData("setNextPool", [pools.get(nextPoolId) as string, nextSeriesId])
      },
    )
  }

  // Propose, approve, execute
  const txHash = await timelock.callStatic.propose(proposal)
  await relay.execute(
    [
      {
        target: timelock.address,
        data: timelock.interface.encodeFunctionData('propose', [proposal])
      },
      {
        target: timelock.address,
        data: timelock.interface.encodeFunctionData('approve', [txHash])
      },
      {
        target: timelock.address,
        data: timelock.interface.encodeFunctionData('execute', [proposal])
      },
    ]
  ); console.log(`Executed ${txHash}`)
  // await timelock.propose(proposal); console.log(`Proposed ${txHash}`)
  // await timelock.approve(txHash); console.log(`Approved ${txHash}`)
  // await timelock.execute(proposal); console.log(`Executed ${txHash}`)
})()
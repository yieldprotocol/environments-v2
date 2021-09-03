/**
 * @dev This script initializes strategies in the protocol.
 * 
 * It takes as inputs the governance json address file.
 */

import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { jsonToMap } from '../shared/helpers'

import { ERC20Mock } from '../typechain/ERC20Mock'
import { Strategy } from '../typechain/Strategy'
import { Ladle } from '../typechain/Ladle'
import { Timelock } from '../typechain/Timelock'

(async () => {
  // Input data
  const strategiesInit: Array<[string, [string, string], [string, string]]> = [ // [strategyId, [startPoolId, startSeriesId],[nextPoolId,nextSeriesId]]
    ['DAI3M', ["0x444149310000", "0x444149310000"],["0x444149320000", "0x444149320000"]], // poolId and seriesId usually match
    ['USDC3M', ["0x555344433100","0x555344433100"],["0x555344433200","0x555344433200"]],
    ['USDT3M', ["0x555344543100","0x555344543100"],["0x555344543200","0x555344543200"]]
  ]
  
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

    proposal.push(
      {
        target: strategy.address,
        data: strategy.interface.encodeFunctionData("setNextPool", [pools.get(startPoolId) as string, startSeriesId])
      }
    )
    proposal.push(
      {
        target: base.address,
        data: base.interface.encodeFunctionData("mint", [strategy.address, '1000000000000000000000'])
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
        data: strategy.interface.encodeFunctionData("setNextPool", [pools.get(nextPoolId) as string, nextSeriesId])
      },
    )
    proposal.push(
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
    )
  }
  
  // Propose, update, execute
  const txHash = await timelock.callStatic.propose(proposal)
  await timelock.propose(proposal); console.log(`Proposed ${txHash}`)
  await timelock.approve(txHash); console.log(`Approved ${txHash}`)
  await timelock.execute(proposal); console.log(`Executed ${txHash}`)
})()
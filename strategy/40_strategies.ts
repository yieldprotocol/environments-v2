import { ethers, waffle } from 'hardhat'
import *  as fs from 'fs'
import *  as hre from 'hardhat'
import { id } from '@yield-protocol/utils-v2'
import { jsonToMap, mapToJson, verify } from '../shared/helpers'
import { WAD, ETH, DAI, USDC, WBTC, USDT } from '../shared/constants'

import StrategyArtifact from '../artifacts/@yield-protocol/strategy-v2/contracts/Strategy.sol/Strategy.json'

import { Ladle } from '../typechain/Ladle'
import { Strategy } from '../typechain/Strategy'
import { Timelock } from '../typechain/Timelock'
import { Relay } from '../typechain/Relay'

const { deployContract } = waffle

const assets = jsonToMap(fs.readFileSync('./output/assets.json', 'utf8')) as Map<string,string>;
const strategies = jsonToMap(fs.readFileSync('./output/strategies.json', 'utf8')) as Map<string,string>;
const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string, string>;
const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string, string>;

/**
 * @dev This script deploys strategies specified in config.ts
 */

(async () => {
    // Series to deploy. A FYToken and Pool will be deployed for each one. The underlying assets must exist and have been added as bases. The collaterals accepted must exist and have been added as collateral for the fyToken underlying asset.
    const strategiesData: Array<[string, string, string]> = [ // name, symbol, baseId
      ['DAIQ1', 'DAIQ1', DAI],
      ['DAIQ2', 'DAIQ2', DAI],
      ['USDCQ1', 'USDCQ1', USDC],
      ['USDCQ2', 'USDCQ2', USDC],
    ]

    /* await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: ["0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5"],
    });
    const ownerAcc = await ethers.getSigner("0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5") */
    const [ ownerAcc ] = await ethers.getSigners();    
    const ladle = await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc) as unknown as Ladle
    const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc) as unknown as Timelock
    const relay = await ethers.getContractAt('Relay', governance.get('relay') as string, ownerAcc) as unknown as Relay
    const ROOT = await timelock.ROOT()

    const strategyFactory = await ethers.getContractFactory('Strategy', {
      libraries: {
        SafeERC20Namer: protocol.get('safeERC20Namer') as string,
      },
    })

    const strategies = jsonToMap(fs.readFileSync('./output/strategies.json', 'utf8')) as Map<string, string>;

    for (let [name, symbol, baseId] of strategiesData) {
      const baseAddress = assets.get(baseId) as string
      const strategy = (await strategyFactory.deploy(name, symbol, ladle.address, baseAddress, baseId)) as Strategy
      console.log(`[Strategy, '${strategy.address}'],`)
      verify(strategy.address, [name, symbol, ladle.address, baseAddress, baseId], 'safeERC20Namer.js')
      strategies.set(symbol, strategy.address)
      fs.writeFileSync('./output/strategies.json', mapToJson(strategies), 'utf8')
      await strategy.grantRole(ROOT, timelock.address); console.log(`strategy.grantRoles(ROOT, timelock)`)

      // Build the proposal
      const proposal : Array<{ target: string; data: string }> = []

      proposal.push(
        {
          target: strategy.address,
          data: strategy.interface.encodeFunctionData("grantRoles", [
            [
              ROOT,
              id(strategy.interface, 'setRewardsToken(address)'),
              id(strategy.interface, 'setRewards(uint32,uint32,uint96)'),
              id(strategy.interface, 'setYield(address)'),
              id(strategy.interface, 'setTokenId(bytes6)'),
              id(strategy.interface, 'resetTokenJoin()'),
              id(strategy.interface, 'setNextPool(address,bytes6)'),
            ],
            timelock.address
          ])
        }
      ); console.log(`strategy(${symbol}).grantRoles(gov, timelock)`)
      proposal.push(
        {
          target: strategy.address,
          data: strategy.interface.encodeFunctionData("revokeRole", [ROOT, ownerAcc.address])
        }
      ); console.log(`strategy(${symbol}).revokeRole(ROOT, deployer)`)

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
    }
})()
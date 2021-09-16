/**
 * @dev This script adds one or more series to the protocol.
 * 
 * It takes as inputs the governance and protocol json address files.
 * It uses the Wand to add the series:
 *  - Deploying a fyToken and adds it to the Cauldron, permissioned for the specified ilks.
 *  - Deploying a pool and adding it to the Ladle, which gets permissions to mint and burn.
 * The Timelock and Cloak get ROOT access to the new FYToken. Root access is NOT removed from the Wand.
 * The Timelock gets access to governance functions in the new FYToken.
 * A plan is recorded in the Cloak to isolate the FYToken from the Ladle.
 * It adds to the fyTokens and pools json address files.
 * @notice Adding one series is 6M gas, maybe add just one per proposal
 */

import { ethers } from 'hardhat'
import * as hre from 'hardhat'
import *  as fs from 'fs'
import { id } from '@yield-protocol/utils-v2'
import { bytesToString, stringToBytes6, mapToJson, jsonToMap, verify } from '../shared/helpers'
import { DAI, USDC, ETH, WBTC } from '../shared/constants'

import { Cauldron } from '../typechain/Cauldron'
import { Ladle } from '../typechain/Ladle'
import { Wand } from '../typechain/Wand'
import { Join } from '../typechain/Join'
import { FYToken } from '../typechain/FYToken'
import { Pool } from '../typechain/Pool'

import { Timelock } from '../typechain/Timelock'
import { Relay } from '../typechain/Relay'
import { EmergencyBrake } from '../typechain/EmergencyBrake'

(async () => {
  // Input data
  const EOSEP21 = 1633042799
  const EODEC21 = 1640995199
  const EOMAR22 = 1648771199

  const EO1009 = 1631314799
  const EO1109 = 1631401199
  const EO1209 = 1631487599
  const EO1309 = 1631573999
  const EO1409 = 1631660399
  const EO1509 = 1631746799
  const EO1609 = 1631833199
  const EO1709 = 1631919599

  const newSeries: Array<[string, string, number, string[], string, string]> = [
//    [stringToBytes6('0203'), DAI, EOSEP21, [DAI, USDC, ETH, WBTC], 'DAI01', 'DAI01'], // Sep21
//    [stringToBytes6('0204'), DAI, EODEC21, [DAI, USDC, ETH, WBTC], 'DAI02', 'DAI02'], // Dec21
//    [stringToBytes6('0303'), USDC, EOSEP21, [USDC, DAI, ETH, WBTC], 'USDC01', 'USDC01'],
//    [stringToBytes6('0304'), USDC, EODEC21, [USDC, DAI, ETH, WBTC], 'USDC02', 'USDC02'],
    [stringToBytes6('0316'), USDC, EO1609, [USDC, DAI, ETH, WBTC], 'USDC16', 'USDC16'],
    [stringToBytes6('0317'), USDC, EO1709, [USDC, DAI, ETH, WBTC], 'USDC17', 'USDC17'],
  ]
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: ["0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5"],
  });
  const ownerAcc = await ethers.getSigner("0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5")
  // const [ ownerAcc ] = await ethers.getSigners();
  const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string, string>;
  const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string,string>;
  const joins = jsonToMap(fs.readFileSync('./output/joins.json', 'utf8')) as Map<string, string>;
  const fyTokens = jsonToMap(fs.readFileSync('./output/fyTokens.json', 'utf8')) as Map<string, string>;
  const pools = jsonToMap(fs.readFileSync('./output/pools.json', 'utf8')) as Map<string, string>;

  // Contract instantiation
  const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc) as unknown as Cauldron
  const ladle = await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc) as unknown as Ladle
  const wand = await ethers.getContractAt('Wand', protocol.get('wand') as string, ownerAcc) as unknown as Wand
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc) as unknown as Timelock
  const relay = await ethers.getContractAt('Relay', governance.get('relay') as string, ownerAcc) as unknown as Relay
  const cloak = await ethers.getContractAt('EmergencyBrake', governance.get('cloak') as string, ownerAcc) as unknown as EmergencyBrake
  const ROOT = await timelock.ROOT()

  // Each series costs 10M gas to deploy, so there is no bundling of several series in a single proposal
  for (let [seriesId, baseId, maturity, ilkIds, name, symbol] of newSeries) {
    // Build the proposal
    let proposal : Array<{ target: string; data: string }> = []

    proposal.push({
      target: wand.address,
      data: wand.interface.encodeFunctionData("addSeries", [seriesId, baseId, maturity, ilkIds, name, symbol])
    })

    // Propose, approve, execute
    let txHash = await timelock.callStatic.propose(proposal)
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

    // The fyToken and pools files can only be updated after the successful execution of the proposal
    const fyToken = await ethers.getContractAt('FYToken', (await cauldron.series(seriesId)).fyToken, ownerAcc) as FYToken
    console.log(`[${await fyToken.symbol()}, '${fyToken.address}'],`)
    verify(fyToken.address, [
      await fyToken.underlyingId(),
      await fyToken.oracle(),
      await fyToken.join(),
      await fyToken.maturity(),
      await fyToken.name(),
      await fyToken.symbol(),
    ], 'safeERC20Namer.js')
    fyTokens.set(seriesId, fyToken.address)
    fs.writeFileSync('./output/fyTokens.json', mapToJson(fyTokens), 'utf8')

    const pool = await ethers.getContractAt('Pool', await ladle.pools(seriesId), ownerAcc) as Pool
    console.log(`[${await fyToken.symbol()}Pool, '${pool.address}'],`)
    verify(pool.address, [], 'safeERC20Namer.js')
    pools.set(seriesId, pool.address)
    fs.writeFileSync('./output/pools.json', mapToJson(pools), 'utf8')

    // Give access to each of the fyToken governance functions to the timelock, through a proposal to bundle them
    // Give ROOT to the cloak, Timelock already has ROOT as the deployer
    // Store a plan for isolating FYToken from Ladle and Base Join
    proposal  = []

    const join = await ethers.getContractAt('Join', joins.get(baseId) as string, ownerAcc) as Join

    proposal.push({
      target: fyToken.address,
      data: fyToken.interface.encodeFunctionData('grantRoles', [
          [
              id(fyToken.interface, 'point(bytes32,address)'),
          ],
          timelock.address
      ])
    })
    console.log(`fyToken.grantRoles(gov, timelock)`)

    proposal.push({
      target: fyToken.address,
      data: fyToken.interface.encodeFunctionData('grantRole', [ROOT, cloak.address])
    })
    console.log(`fyToken.grantRole(ROOT, cloak)`)

    proposal.push({
      target: cloak.address,
      data: cloak.interface.encodeFunctionData('plan', [ladle.address,
        [
          {
            contact: fyToken.address, signatures: [
              id(fyToken.interface, 'mint(address,uint256)'),
              id(fyToken.interface, 'burn(address,uint256)'),
            ]
          }
        ]
      ])
    })
    console.log(`cloak.plan(ladle, fyToken(${bytesToString(seriesId)}))`)

    proposal.push({
      target: cloak.address,
      data: cloak.interface.encodeFunctionData('plan', [fyToken.address,
        [
          {
            contact: join.address, signatures: [
              id(join.interface, 'exit(address,uint128)'),
            ]
          }
        ]
      ])
    })
    console.log(`cloak.plan(fyToken, join(${bytesToString(baseId)}))`)

    // Propose, approve, execute
    txHash = await timelock.callStatic.propose(proposal)
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

    // Retrieve the isolation hashes
    let logs = await cloak.queryFilter(cloak.filters.Planned(null, null))
    let event = logs[logs.length - 1]
    console.log(`Isolate FYToken from Join with ${event.args.txHash}`)
    event = logs[logs.length - 2]
    console.log(`Isolate FYToken from Ladle with ${event.args.txHash}`)
   }
})()
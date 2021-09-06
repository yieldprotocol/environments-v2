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
import *  as fs from 'fs'
import { id } from '@yield-protocol/utils-v2'
import { bytesToString, stringToBytes6, mapToJson, jsonToMap, verify } from '../shared/helpers'
import { DAI, USDC, ETH, WBTC, USDT } from '../shared/constants'

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

  const EO3108 = 1630454399
  const EO0109 = 1630540799
  const EO0209 = 1630627199
  const EO0309 = 1630713599
  const EO0409 = 1630799999
  const EO0609 = 1630972799
  const EO0709 = 1631059199
  const EO0809 = 1631145599
  const EO0909 = 1631231999
  const EO1009 = 1631318399

  const newSeries: Array<[string, string, number, string[], string, string]> = [
//    [stringToBytes6('DAI31'), DAI, EO3108, [DAI, USDC, ETH, WBTC, USDT], 'DAI31', 'DAI31'],
//    [stringToBytes6('DAI01'), DAI, EO0109, [DAI, USDC, ETH, WBTC, USDT], 'DAI01', 'DAI01'],
//    [stringToBytes6('DAI02'), DAI, EO0209, [DAI, USDC, ETH, WBTC, USDT], 'DAI02', 'DAI02'],
//    [stringToBytes6('DAI03'), DAI, EO0309, [DAI, USDC, ETH, WBTC, USDT], 'DAI03', 'DAI03'],
//    [stringToBytes6('DAI04'), DAI, EO0409, [DAI, USDC, ETH, WBTC, USDT], 'DAI04', 'DAI04'],
//    [stringToBytes6('DAI06'), DAI, EO0609, [DAI, USDC, ETH, WBTC, USDT], 'DAI06', 'DAI06'],
//    [stringToBytes6('DAI07'), DAI, EO0709, [DAI, USDC, ETH, WBTC, USDT], 'DAI07', 'DAI07'],
//    [stringToBytes6('DAI08'), DAI, EO0809, [DAI, USDC, ETH, WBTC, USDT], 'DAI08', 'DAI08'],

//    [stringToBytes6('DAI1'), DAI, EOSEP21, [DAI, USDC, ETH, WBTC, USDT], 'DAI1', 'DAI1'], // Sep21
//    [stringToBytes6('DAI2'), DAI, EODEC21, [DAI, USDC, ETH, WBTC, USDT], 'DAI2', 'DAI2'], // Dec21
//    [stringToBytes6('USDC1'), USDC, EOSEP21, [USDC, DAI, ETH, WBTC, USDT], 'USDC1', 'USDC1'],
//    [stringToBytes6('USDC2'), USDC, EODEC21, [USDC, DAI, ETH, WBTC, USDT], 'USDC2', 'USDC2'],
//    [stringToBytes6('USDT1'), USDT, EOSEP21, [USDT, DAI, USDC, ETH, WBTC], 'USDT1', 'USDT1'],
//    [stringToBytes6('USDT2'), USDT, EODEC21, [USDT, DAI, USDC, ETH, WBTC], 'USDT2', 'USDT2']

//    [stringToBytes6('DAI21'), DAI, EOSEP21, [DAI, USDC, ETH, WBTC, USDT], 'DAI21', 'DAI21'], // Sep21
//    [stringToBytes6('DAI22'), DAI, EODEC21, [DAI, USDC, ETH, WBTC, USDT], 'DAI22', 'DAI22'], // Dec21
//    [stringToBytes6('USDC21'), USDC, EOSEP21, [USDC, DAI, ETH, WBTC, USDT], 'USDC21', 'USDC21'],
//    [stringToBytes6('USDC22'), USDC, EODEC21, [USDC, DAI, ETH, WBTC, USDT], 'USDC22', 'USDC22'],
//    [stringToBytes6('USDT21'), USDT, EOSEP21, [USDT, DAI, USDC, ETH, WBTC], 'USDT21', 'USDT21'],
    [stringToBytes6('USDT22'), USDT, EODEC21, [USDT, DAI, USDC, ETH, WBTC], 'USDT22', 'USDT22']
  ]
  const [ ownerAcc ] = await ethers.getSigners();
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
  }
})()
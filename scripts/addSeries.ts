/**
 * @dev This script adds one or more series to the protocol.
 * 
 * It takes as inputs the governance and protocol json address files.
 * It uses the Wand to add the series:
 *  - Deploying a fyToken and adds it to the Cauldron, permissioned for the specified ilks.
 *  - Deploying a pool and adding it to the Ladle, which gets permissions to mint and burn.
 * It adds to the fyTokens and pools json address files.
 * @notice Adding one series is 6M gas, maybe add just one per proposal
 */

import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { stringToBytes6, mapToJson, jsonToMap, verify } from '../shared/helpers'
import { DAI } from '../shared/constants'

import { Cauldron } from '../typechain/Cauldron'
import { Ladle } from '../typechain/Ladle'
import { Wand } from '../typechain/Wand'
import { FYToken } from '../typechain/FYToken'
import { Pool } from '../typechain/Pool'

import { Timelock } from '../typechain/Timelock'

(async () => {
  // Input data
  const EO2608 = 1630022399
  const EO2708 = 1630108799
  const EO2808 = 1630195199
  const TST1 = stringToBytes6('TST1')
  const TST2 = stringToBytes6('TST2')
  const TST3 = stringToBytes6('TST3')
  const newSeries: Array<[string, string, number, string[], string, string]> = [
//    [stringToBytes6('DAI26'), DAI, EO2608, [TST1, TST2, TST3], 'DAI26', 'DAI26'],
    [stringToBytes6('DAI27'), DAI, EO2708, [TST1, TST2, TST3], 'DAI27', 'DAI27'],
//    [stringToBytes6('DAI28'), DAI, EO2808, [TST1, TST2, TST3], 'DAI28', 'DAI28'],
  ]
  const [ ownerAcc ] = await ethers.getSigners();
  const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string, string>;
  const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string,string>;
  const fyTokens = jsonToMap(fs.readFileSync('./output/fyTokens.json', 'utf8')) as Map<string, string>;
  const pools = jsonToMap(fs.readFileSync('./output/pools.json', 'utf8')) as Map<string, string>;

  // Contract instantiation
  const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc) as unknown as Cauldron
  const ladle = await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc) as unknown as Ladle
  const wand = await ethers.getContractAt('Wand', protocol.get('wand') as string, ownerAcc) as unknown as Wand
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc) as unknown as Timelock

  // Build the proposal
  const proposal : Array<{ target: string; data: string}> = []
  for (let [seriesId, baseId, maturity, ilkIds, name, symbol] of newSeries) {
    proposal.push({
      target: wand.address,
      data: wand.interface.encodeFunctionData("addSeries", [seriesId, baseId, maturity, ilkIds, name, symbol])
    })
  }

  // Propose, update, execute
  const txHash = await timelock.callStatic.propose(proposal)
  await timelock.propose(proposal); console.log(`Proposed ${txHash}`)

  fs.writeFileSync('./output/fyTokens.json', mapToJson(fyTokens), 'utf8')

  await timelock.approve(txHash); console.log(`Approved ${txHash}`)
  await timelock.execute(proposal); console.log(`Executed ${txHash}`)

  // The fyToken and pools files can only be updated after the successful execution of the proposal
  for (let [seriesId] of newSeries) {
    const fyToken = await ethers.getContractAt('FYToken', (await cauldron.series(seriesId)).fyToken, ownerAcc) as FYToken
    console.log(`[${await fyToken.symbol()}, '${fyToken.address}'],`)
    verify(fyToken.address, [
      await fyToken.underlying(),
      await fyToken.oracle(),
      await fyToken.join(),
      await fyToken.maturity(),
      await fyToken.name(),
      await fyToken.symbol(),
    ], 'safeERC20Namer.js')
    fyTokens.set(seriesId, fyToken.address)

    const pool = await ethers.getContractAt('Pool', await ladle.pools(seriesId), ownerAcc) as Pool
    console.log(`[${await fyToken.symbol()}Pool, '${pool.address}'],`)
    verify(pool.address, [], 'safeERC20Namer.js')
    pools.set(seriesId, pool.address)
  }
  fs.writeFileSync('./output/fyTokens.json', mapToJson(fyTokens), 'utf8')
  fs.writeFileSync('./output/pools.json', mapToJson(pools), 'utf8')
})()
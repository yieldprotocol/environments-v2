/**
 * @dev This script replaces one or more spot data sources in a MultiOracle.
 * 
 * It takes as inputs the governance, protocol and spotSources json address files.
 * It rewrites the spotSources json address file.
 * @notice This can be used to update RATE and CHI by entering those as quoteId, and using a rate and chi oracle
 */

import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { stringToBytes6, bytesToString, bytesToBytes32, mapToJson, jsonToMap } from '../shared/helpers'
import { WAD, DAI, ETH, USDC, USDT, WBTC } from '../shared/constants'

import { ChainlinkMultiOracle } from '../typechain/ChainlinkMultiOracle' // TODO: Change to IOracleGov
import { Timelock } from '../typechain/Timelock'

(async () => {
  const TST = stringToBytes6('TST')
  // Input data: baseId, quoteId, oracle name, source address
  const newSources: Array<[string, string, string, string]> = [
    // [DAI, stringToBytes6('TST1'), 'chainlinkOracle', "0xF32D39ff9f6Aa7a7A64d7a4F00a54826Ef791a55"],
    [DAI, ETH,   'chainlinkOracle', "0x22B58f1EbEDfCA50feF632bD73368b2FdA96D541"],
    [DAI, TST,   'chainlinkOracle', "0x6882f3a206d6aBd729BcAd2fa237d8Cb02a4FaBD"],
    [USDC, ETH,  'chainlinkOracle', "0x64EaC61A2DFda2c3Fa04eED49AA33D021AeC8838"],
    [USDC, TST,  'chainlinkOracle', "0xe6335d692ea0deAa2fa85eB6a396622088025dE0"],
    [USDT, ETH,  'chainlinkOracle', "0x0bF499444525a23E7Bb61997539725cA2e928138"],
    [USDT, TST,  'chainlinkOracle', "0x38912f6844239F530EC5E82d684288EA9111e3Cd"],
    [WBTC, ETH,  'chainlinkOracle', "0xF7904a295A029a3aBDFFB6F12755974a958C7C25"]
  ]
  const [ ownerAcc ] = await ethers.getSigners();
  const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string, string>;
  const assets = jsonToMap(fs.readFileSync('./output/assets.json', 'utf8')) as Map<string,string>;
  const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string,string>;
  const spotSources = jsonToMap(fs.readFileSync('./output/spotSources.json', 'utf8')) as Map<string, string>;

  // Contract instantiation
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc) as unknown as Timelock

  // Build proposal
  const proposal : Array<{ target: string; data: string}> = []
  for (let [baseId, quoteId, oracleName, sourceAddress] of newSources) {
    const pairId = `${baseId},${quoteId}`
    const oracle = await ethers.getContractAt('ChainlinkMultiOracle', protocol.get(oracleName) as string, ownerAcc) as unknown as ChainlinkMultiOracle

    proposal.push({
      target: oracle.address,
      data: oracle.interface.encodeFunctionData("setSource", [baseId, assets.get(baseId) as string, quoteId, assets.get(quoteId) as string, sourceAddress])
    })
    console.log(`[spot: ${bytesToString(baseId)}/${bytesToString(quoteId)}: ${spotSources.get(pairId) || undefined} -> ${sourceAddress}],`)
    spotSources.set(pairId, sourceAddress)
  }

  // Propose, update, execute
  const txHash = await timelock.callStatic.propose(proposal)
  await timelock.propose(proposal); console.log(`Proposed ${txHash}`)

  fs.writeFileSync('./output/spotSources.json', mapToJson(spotSources), 'utf8')

  await timelock.approve(txHash); console.log(`Approved ${txHash}`)
  await timelock.execute(proposal); console.log(`Executed ${txHash}`)
})()

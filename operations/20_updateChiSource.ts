/**
 * @dev This script replaces one or more chi data sources in the CompoundMultiOracle.
 * 
 * It takes as inputs the governance, protocol and chiSources json address files.
 * It rewrites the chiSources json address file.
 */

import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { stringToBytes6, bytesToString, mapToJson, jsonToMap } from '../shared/helpers'
import { CHI, DAI, USDC, USDT } from '../shared/constants'

import { CompoundMultiOracle } from '../typechain/CompoundMultiOracle'
import { Timelock } from '../typechain/Timelock'

(async () => {
  // Input data
  const newSources: Array<[string, string]> = [
    [DAI,  "0x5d3a536e4d6dbd6114cc1ead35777bab948e3643"],
    [USDC, "0x39aa39c021dfbae8fac545936693ac917d5e7563"],
  ]
  const [ ownerAcc ] = await ethers.getSigners();
  const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string, string>;
  const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string,string>;
  const chiSources = jsonToMap(fs.readFileSync('./output/chiSources.json', 'utf8')) as Map<string, string>;

  // Contract instantiation
  const compoundOracle = await ethers.getContractAt('CompoundMultiOracle', protocol.get('compoundOracle') as string, ownerAcc) as unknown as CompoundMultiOracle
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc) as unknown as Timelock

  console.log(`compoundOracle: ${compoundOracle.address}],`)

  // Build proposal
  const proposal : Array<{ target: string; data: string}> = []
  for (let [baseId, sourceAddress] of newSources) {
    proposal.push({
      target: compoundOracle.address,
      data: compoundOracle.interface.encodeFunctionData("setSource", [baseId, CHI, sourceAddress])
    })
    console.log(`[Chi(${bytesToString(baseId)}): ${chiSources.get(baseId) || undefined} -> ${sourceAddress}],`)
    chiSources.set(baseId, sourceAddress)
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
  fs.writeFileSync('./output/chiSources.json', mapToJson(chiSources), 'utf8')
})()

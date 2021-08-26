/**
 * @dev This script replaces one or more rate data sources in the CompoundMultiOracle.
 * 
 * It takes as inputs the governance, protocol and rateSources json address files.
 * It rewrites the rateSources json address file.
 */

import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { stringToBytes6, bytesToString, mapToJson, jsonToMap } from '../shared/helpers'
import { RATE, DAI } from '../shared/constants'

import { CompoundMultiOracle } from '../typechain/CompoundMultiOracle'
import { Timelock } from '../typechain/Timelock'

(async () => {
  // Input data
  const newSources: Array<[string, string]> = [
    [DAI,                    "0xab16A69A5a8c12C732e0DEFF4BE56A70bb64c926"],
    [stringToBytes6('TST2'), "0x1f10F3Ba7ACB61b2F50B9d6DdCf91a6f787C0E82"],
    [stringToBytes6('TST3'), "0x525C7063E7C20997BaaE9bDa922159152D0e8417"],
  ]
  const [ ownerAcc ] = await ethers.getSigners();
  const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string, string>;
  const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string,string>;
  const rateSources = jsonToMap(fs.readFileSync('./output/rateSources.json', 'utf8')) as Map<string, string>;

  // Contract instantiation
  const compoundOracle = await ethers.getContractAt('CompoundMultiOracle', protocol.get('compoundOracle') as string, ownerAcc) as unknown as CompoundMultiOracle
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc) as unknown as Timelock

  // Build proposal
  const proposal : Array<{ target: string; data: string}> = []
  for (let [baseId, sourceAddress] of newSources) {
    proposal.push({
      target: compoundOracle.address,
      data: compoundOracle.interface.encodeFunctionData("setSource", [baseId, RATE, sourceAddress])
    })
    console.log(`[Rate: ${bytesToString(baseId)}: ${rateSources.get(baseId) || undefined} -> ${sourceAddress}],`)
    rateSources.set(baseId, sourceAddress)
  }

  // Propose, update, execute
  const txHash = await timelock.callStatic.propose(proposal)
  await timelock.propose(proposal); console.log(`Proposed ${txHash}`)

  fs.writeFileSync('./output/rateSources.json', mapToJson(rateSources), 'utf8')

  await timelock.approve(txHash); console.log(`Approved ${txHash}`)
  await timelock.execute(proposal); console.log(`Executed ${txHash}`)
})()

/**
 * @dev This script replaces one or more rate data sources in the CompoundMultiOracle.
 * 
 * It takes as inputs the governance, protocol and rateSources json address files.
 * It rewrites the rateSources json address file.
 */

import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { stringToBytes6, bytesToString, mapToJson, jsonToMap } from '../shared/helpers'
import { RATE, DAI, USDC, USDT } from '../shared/constants'

import { CompoundMultiOracle } from '../typechain/CompoundMultiOracle'
import { Timelock } from '../typechain/Timelock'

(async () => {
  // Input data
  const newSources: Array<[string, string]> = [
    [DAI,  "0x78F3579FbBb4a9894cE27cC201216Ef46A132f1c"],
    [USDC, "0x625E23f0C081CF8a2bbb87738087D8b0A5f5F412"],
    [USDT, "0xBce93F0D091092D780C6A386fb6d34780FFb031C"],
    // [stringToBytes6('TST3'), "0x8A93d247134d91e0de6f96547cB0204e5BE8e5D8"],
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

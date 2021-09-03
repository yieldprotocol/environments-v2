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
    [DAI,  "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE"],
    [USDC, "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c"],
    [USDT, "0x59b670e9fA9D0A427751Af201D676719a970857b"],
    // [stringToBytes6('TST3'), "0x8A93d247134d91e0de6f96547cB0204e5BE8e5D8"],
  ]
  const [ ownerAcc ] = await ethers.getSigners();
  const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string, string>;
  const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string,string>;
  const chiSources = jsonToMap(fs.readFileSync('./output/chiSources.json', 'utf8')) as Map<string, string>;

  // Contract instantiation
  const compoundOracle = await ethers.getContractAt('CompoundMultiOracle', protocol.get('compoundOracle') as string, ownerAcc) as unknown as CompoundMultiOracle
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc) as unknown as Timelock

  // Build proposal
  const proposal : Array<{ target: string; data: string}> = []
  for (let [baseId, sourceAddress] of newSources) {
    proposal.push({
      target: compoundOracle.address,
      data: compoundOracle.interface.encodeFunctionData("setSource", [baseId, CHI, sourceAddress])
    })
    console.log(`[Chi: ${bytesToString(baseId)}: ${chiSources.get(baseId) || undefined} -> ${sourceAddress}],`)
    chiSources.set(baseId, sourceAddress)
  }

  // Propose, update, execute
  const txHash = await timelock.callStatic.propose(proposal)
  await timelock.propose(proposal); console.log(`Proposed ${txHash}`)

  fs.writeFileSync('./output/chiSources.json', mapToJson(chiSources), 'utf8')

  await timelock.approve(txHash); console.log(`Approved ${txHash}`)
  await timelock.execute(proposal); console.log(`Executed ${txHash}`)
})()

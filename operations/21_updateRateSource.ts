/**
 * @dev This script replaces one or more rate data sources in the CompoundMultiOracle.
 * 
 * It takes as inputs the governance, protocol and rateSources json address files.
 * It rewrites the rateSources json address file.
 */

import { ethers } from 'hardhat'
import *  as fs from 'fs'
import *  as hre from 'hardhat'
import { stringToBytes6, bytesToString, mapToJson, jsonToMap } from '../shared/helpers'
import { RATE, DAI, USDC, USDT } from '../shared/constants'

import { CompoundMultiOracle } from '../typechain/CompoundMultiOracle'
import { ERC20Mock } from '../typechain/ERC20Mock'
import { Timelock } from '../typechain/Timelock'

(async () => {
  // Input data
  const newSources: Array<[string, string]> = [
    [DAI,  "0x5d3a536e4d6dbd6114cc1ead35777bab948e3643"],
    [USDC, "0x39aa39c021dfbae8fac545936693ac917d5e7563"],
    // [stringToBytes6('TST3'), "0x8A93d247134d91e0de6f96547cB0204e5BE8e5D8"],
  ]
  /* await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: ["0xA072f81Fea73Ca932aB2B5Eda31Fa29306D58708"],
  });
  const ownerAcc = await ethers.getSigner("0xA072f81Fea73Ca932aB2B5Eda31Fa29306D58708") */
    const [ ownerAcc ] = await ethers.getSigners();  const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string, string>;
  const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string,string>;
  const rateSources = jsonToMap(fs.readFileSync('./output/rateSources.json', 'utf8')) as Map<string, string>;

  // Contract instantiation
  const compoundOracle = await ethers.getContractAt('CompoundMultiOracle', protocol.get('compoundOracle') as string, ownerAcc) as unknown as CompoundMultiOracle
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc) as unknown as Timelock

  console.log(`compoundOracle: ${compoundOracle.address}`)

  // Build proposal
  const proposal : Array<{ target: string; data: string}> = []
  for (let [baseId, sourceAddress] of newSources) {
    const cToken = await ethers.getContractAt('ERC20Mock', sourceAddress as string, ownerAcc) as unknown as ERC20Mock
    console.log(`Using ${await cToken.name()} at ${sourceAddress}`)
    proposal.push({
      target: compoundOracle.address,
      data: compoundOracle.interface.encodeFunctionData("setSource", [baseId, RATE, sourceAddress])
    })
    console.log(`[Rate(${bytesToString(baseId)}): ${rateSources.get(baseId) || undefined} -> ${sourceAddress}],`)
    rateSources.set(baseId, sourceAddress)
  }

  // Propose, approve, execute
  const txHash = await timelock.hash(proposal); console.log(`Proposal: ${txHash}`)
  if ((await timelock.proposals(txHash)).state === 0) { 
    await timelock.propose(proposal); console.log(`Proposed ${txHash}`) 
    while ((await timelock.proposals(txHash)).state < 1) { }
  }
  if ((await timelock.proposals(txHash)).state === 1) {
    await timelock.approve(txHash); console.log(`Approved ${txHash}`)
    while ((await timelock.proposals(txHash)).state < 2) { }
  }
  if ((await timelock.proposals(txHash)).state === 2) { 
    await timelock.execute(proposal); console.log(`Executed ${txHash}`) 
    while ((await timelock.proposals(txHash)).state > 0) { }
  }

  fs.writeFileSync('./output/rateSources.json', mapToJson(rateSources), 'utf8')
})()


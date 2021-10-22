/**
 * @dev This script makes one or more assets into bases.
 * 
 * It takes as inputs the governance and protocol json address files.
 * It uses the Wand to add the relevant rate source to Cauldron, and to permission the Witch to liquidate debt.
 * It verifies that the oracle supplied can return rate and chi for the new bases.
 * A plan is recorded in the Cloak to isolate the Join from the Witch.
 */

import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { id } from '@yield-protocol/utils-v2'
import { bytesToString, bytesToBytes32, jsonToMap } from '../shared/helpers'
import { CHI, RATE, DAI, USDC, USDT } from '../shared/constants'

import { Wand } from '../typechain/Wand'
import { Join } from '../typechain/Join'
import { IOracle } from '../typechain/IOracle'

import { Timelock } from '../typechain/Timelock'
import { EmergencyBrake } from '../typechain/EmergencyBrake'

(async () => {
  // Input data
  const newBases: Array<[string, string]> = [
    [DAI,  'compoundOracle'],
    [USDC, 'compoundOracle'],
//    [USDT, 'compoundOracle'],
  ]
  const [ ownerAcc ] = await ethers.getSigners();
  const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string, string>;
  const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string,string>;
  const joins = jsonToMap(fs.readFileSync('./output/joins.json', 'utf8')) as Map<string, string>;

  // Contract instantiation
  const wand = await ethers.getContractAt('Wand', protocol.get('wand') as string, ownerAcc) as unknown as Wand
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc) as unknown as Timelock
  const cloak = await ethers.getContractAt('EmergencyBrake', governance.get('cloak') as string, ownerAcc) as unknown as EmergencyBrake

  // Build the proposal
  // Store a plan in the cloak to isolate the join from the Witch
  const proposal : Array<{ target: string; data: string}> = []
  for (let [assetId, oracleName] of newBases) {
    const join = await ethers.getContractAt('Join', joins.get(assetId) as string, ownerAcc) as Join

    // Test that the sources for rate and chi have been set. Peek will fail with 'Source not found' if they have not.
    const rateChiOracle = await ethers.getContractAt('IOracle', protocol.get(oracleName) as string, ownerAcc) as unknown as IOracle
    console.log(`Current RATE for ${bytesToString(assetId)}: ${(await rateChiOracle.peek(bytesToBytes32(assetId), bytesToBytes32(RATE), 0))[0]}`)
    console.log(`Current CHI for ${bytesToString(assetId)}: ${(await rateChiOracle.peek(bytesToBytes32(assetId), bytesToBytes32(CHI), 0))[0]}`)

    proposal.push({
      target: wand.address,
      data: wand.interface.encodeFunctionData('makeBase', [assetId, rateChiOracle.address])
    })
    console.log(`[Asset: ${bytesToString(assetId)} made into base using ${rateChiOracle.address}],`)

    const plan = [
      {
        contact: join.address, signatures: [
          id(join.interface, 'join(address,uint128)'),
        ]
      }
    ]

    proposal.push({
      target: cloak.address,
      data: cloak.interface.encodeFunctionData('plan', [protocol.get('witch') as string, plan])
    })
    console.log(`cloak.plan(witch, join(${bytesToString(assetId)})): ${await cloak.hash(protocol.get('witch') as string, plan)}`)
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
})()
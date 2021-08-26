/**
 * @dev This script makes one or more assets into bases.
 * 
 * It takes as inputs the governance, protocol, assets and joins json address files.
 * It uses the Wand to add the asset to Cauldron and deploy a new Join, which gets added to the Ladle
 * It adds to the assets and joins json address files.
 * @notice The assetIds can't be already in use
 */

import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { bytesToString, stringToBytes6, bytesToBytes32, jsonToMap } from '../shared/helpers'
import { CHI, RATE } from '../shared/constants'

import { Wand } from '../typechain/Wand'
import { IOracle } from '../typechain/IOracle'

import { Timelock } from '../typechain/Timelock'

(async () => {
  // Input data
  const newBases: Array<[string, string]> = [
    [stringToBytes6('TST1'), 'compoundOracle'],
    [stringToBytes6('TST2'), 'compoundOracle'],
    [stringToBytes6('TST3'), 'compoundOracle'],
  ]
  const [ ownerAcc ] = await ethers.getSigners();
  const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string, string>;
  const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string,string>;

  // Contract instantiation
  const wand = await ethers.getContractAt('Wand', protocol.get('wand') as string, ownerAcc) as unknown as Wand
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc) as unknown as Timelock

  // Build the proposal
  const proposal : Array<{ target: string; data: string}> = []
  for (let [assetId, oracleName] of newBases) {
    // Test that the sources for rate and chi have been set. Peek will fail with 'Source not found' if they have not.
    const rateChiOracle = await ethers.getContractAt('IOracle', protocol.get(oracleName) as string, ownerAcc) as unknown as IOracle
    console.log(`Current RATE for ${bytesToString(assetId)}: ${(await rateChiOracle.peek(bytesToBytes32(assetId), bytesToBytes32(RATE), 0))[0]}`)
    console.log(`Current CHI for ${bytesToString(assetId)}: ${(await rateChiOracle.peek(bytesToBytes32(assetId), bytesToBytes32(CHI), 0))[0]}`)

    proposal.push({
      target: wand.address,
      data: wand.interface.encodeFunctionData('makeBase', [assetId, rateChiOracle.address])
    })
    console.log(`[Asset: ${bytesToString(assetId)} made into base using ${rateChiOracle.address}],`)
  }

  // Propose, approve, execute
  const txHash = await timelock.callStatic.propose(proposal)
  await timelock.propose(proposal); console.log(`Proposed ${txHash}`)
  await timelock.approve(txHash); console.log(`Approved ${txHash}`)
  await timelock.execute(proposal); console.log(`Executed ${txHash}`)
})()
/**
 * @dev This script makes one or more assets into ilks for one or more bases.
 * 
 * It takes as inputs the governance and protocol address files.
 * It uses the Wand to set the spot oracle, debt limits, and allow the Witch to liquidate collateral.
 */

import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { bytesToString, stringToBytes6, bytesToBytes32, jsonToMap } from '../shared/helpers'
import { WAD, DAI } from '../shared/constants'

import { Wand } from '../typechain/Wand'
import { IOracle } from '../typechain/IOracle'

import { Timelock } from '../typechain/Timelock'

(async () => {
  // Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), maxDebt, minDebt, debtDec
  const newIlks: Array<[string, string, string, number, number, number, number]> = [
    [DAI, stringToBytes6('TST1'), 'chainlinkOracle', 1000000, 1000000, 1, 18],
    [DAI, stringToBytes6('TST2'), 'chainlinkOracle', 1000000, 1000000, 1, 18],
    [DAI, stringToBytes6('TST3'), 'chainlinkOracle', 1000000, 1000000, 1, 18],
  ]
  const [ ownerAcc ] = await ethers.getSigners();
  const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string, string>;
  const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string,string>;

  // Contract instantiation
  const wand = await ethers.getContractAt('Wand', protocol.get('wand') as string, ownerAcc) as unknown as Wand
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc) as unknown as Timelock

  // Build the proposal
  const proposal : Array<{ target: string; data: string}> = []
  for (let [baseId, ilkId, oracleName, ratio, maxDebt, minDebt, debtDec] of newIlks) {
    // Test that the sources for spot have been set. Peek will fail with 'Source not found' if they have not.
    const spotOracle = await ethers.getContractAt('IOracle', protocol.get(oracleName) as string, ownerAcc) as unknown as IOracle
    console.log(`Current SPOT for ${bytesToString(baseId)}/${bytesToString(ilkId)}: ${(await spotOracle.peek(bytesToBytes32(baseId), bytesToBytes32(ilkId), WAD))[0]}`)

    proposal.push({
      target: wand.address,
      data: wand.interface.encodeFunctionData('makeIlk', [
        baseId, ilkId, spotOracle.address, ratio, maxDebt, minDebt, debtDec
      ])
    })
    console.log(`[Asset: ${bytesToString(ilkId)} made into ilk for ${bytesToString(baseId)}],`)
  }

  // Propose, approve, execute
  const txHash = await timelock.callStatic.proposeRepeated(proposal, 2)
  await timelock.proposeRepeated(proposal, 2); console.log(`Proposed ${txHash}`)
  await timelock.approve(txHash); console.log(`Approved ${txHash}`)
  await timelock.execute(proposal); console.log(`Executed ${txHash}`)
})()
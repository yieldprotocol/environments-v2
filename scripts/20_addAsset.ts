/**
 * @dev This script adds one or more assets to the protocol.
 * 
 * It takes as inputs the governance, protocol, assets and joins json address files.
 * It uses the Wand to:
 *  - Add the asset to Cauldron.
 *  - Deploy a new Join, which gets added to the Ladle, which gets permissions to join and exit.
 * It adds to the assets and joins json address files.
 * @notice The assetIds can't be already in use
 */

import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { bytesToString, stringToBytes6, mapToJson, jsonToMap, verify } from '../shared/helpers'
import { DAI, USDC, ETH, WBTC, USDT } from '../shared/constants'

import { Ladle } from '../typechain/Ladle'
import { Wand } from '../typechain/Wand'
import { Join } from '../typechain/Join'

import { Timelock } from '../typechain/Timelock'

(async () => {
  const TST = stringToBytes6('TST')
  // Input data
  const newAssets: Array<[string, string]> = [
    [DAI,  "0xaFCdc724EB8781Ee721863db1B15939675996484"],
    [USDC, "0xeaCB3AAB4CA68F1e6f38D56bC5FCc499B76B4e2D"],
    [ETH,  "0x55C0458edF1D8E07DF9FB44B8960AecC515B4492"],
    [TST,  "0x51C9B30BE0417559A467D1f65d710a73E5845B3a"],
    [WBTC, "0xD5FafCE68897bdb55fA11Dd77858Df7a9a458D92"],
    [USDT, "0x233551369dc535f5fF3517c28fDCce81d650063e"]
    // [stringToBytes6('TST3'), "0xfaAddC93baf78e89DCf37bA67943E1bE8F37Bb8c"],
  ] // Adding 6 assets is 10 million gas, approaching the block gas limit here
  const [ ownerAcc ] = await ethers.getSigners();
  const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string, string>;
  const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string,string>;
  const assets = jsonToMap(fs.readFileSync('./output/assets.json', 'utf8')) as Map<string, string>;
  const joins = jsonToMap(fs.readFileSync('./output/joins.json', 'utf8')) as Map<string, string>;

  // Contract instantiation
  const ladle = await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc) as unknown as Ladle
  const wand = await ethers.getContractAt('Wand', protocol.get('wand') as string, ownerAcc) as unknown as Wand
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc) as unknown as Timelock

  // Build the proposal
  const proposal : Array<{ target: string; data: string}> = []
  for (let [assetId, assetAddress] of newAssets) {
    proposal.push({
      target: wand.address,
      data: wand.interface.encodeFunctionData("addAsset", [assetId, assetAddress])
    })
    console.log(`[Asset: ${bytesToString(assetId)}: ${assetAddress}],`)
    assets.set(assetId, assetAddress)
  }

  // Propose, update, execute
  const txHash = await timelock.callStatic.propose(proposal)
  await timelock.propose(proposal); console.log(`Proposed ${txHash}`)

  fs.writeFileSync('./output/assets.json', mapToJson(assets), 'utf8')

  await timelock.approve(txHash); console.log(`Approved ${txHash}`)
  await timelock.execute(proposal); console.log(`Executed ${txHash}`)

  // The joins file can only be updated after the successful execution of the proposal
  for (let [assetId, assetAddress] of newAssets) {
    const join = await ethers.getContractAt('Join', await ladle.joins(assetId), ownerAcc) as Join
    verify(join.address, [assetAddress])
    console.log(`[${bytesToString(assetId)}Join, : '${join.address}'],`)
    joins.set(assetId, join.address)
  }
  fs.writeFileSync('./output/joins.json', mapToJson(joins), 'utf8')
})()
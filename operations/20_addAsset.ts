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
import { id } from '@yield-protocol/utils-v2'
import { bytesToString, stringToBytes6, mapToJson, jsonToMap, verify } from '../shared/helpers'
import { DAI, USDC, ETH, WBTC, USDT } from '../shared/constants'

import { Ladle } from '../typechain/Ladle'
import { Witch } from '../typechain/Witch'
import { Wand } from '../typechain/Wand'
import { Join } from '../typechain/Join'

import { Timelock } from '../typechain/Timelock'
import { EmergencyBrake } from '../typechain/EmergencyBrake'

(async () => {
  const TST = stringToBytes6('TST')
  // Input data
  const newAssets: Array<[string, string]> = [
    [DAI,  "0x5FbDB2315678afecb367f032d93F642f64180aa3"],
    [USDC, "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"],
    [ETH,  "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"],
    [TST,  "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707"],
    [WBTC, "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853"],
    [USDT, "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318"]
    // [stringToBytes6('TST3'), "0xfaAddC93baf78e89DCf37bA67943E1bE8F37Bb8c"],
  ] // Adding 6 assets is 10 million gas, approaching the block gas limit here
  const [ ownerAcc ] = await ethers.getSigners();
  const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string, string>;
  const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string,string>;
  const assets = jsonToMap(fs.readFileSync('./output/assets.json', 'utf8')) as Map<string, string>;
  const joins = jsonToMap(fs.readFileSync('./output/joins.json', 'utf8')) as Map<string, string>;

  // Contract instantiation
  const ladle = await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc) as unknown as Ladle
  const witch = await ethers.getContractAt('Witch', protocol.get('witch') as string, ownerAcc) as unknown as Witch
  const wand = await ethers.getContractAt('Wand', protocol.get('wand') as string, ownerAcc) as unknown as Wand
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc) as unknown as Timelock
  const cloak = await ethers.getContractAt('EmergencyBrake', governance.get('cloak') as string, ownerAcc) as unknown as EmergencyBrake
  const ROOT = await timelock.ROOT()

  // Build the proposal
  let proposal : Array<{ target: string; data: string}> = []
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

  // Give access to each of the Join governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, Timelock already has ROOT as the deployer
  // Store a plan for isolating Join from Ladle and Witch
  proposal = []

  for (let [assetId, assetAddress] of newAssets) {
    const join = await ethers.getContractAt('Join', await ladle.joins(assetId), ownerAcc) as Join
    verify(join.address, [assetAddress])
    console.log(`[${bytesToString(assetId)}Join, : '${join.address}'],`)
    joins.set(assetId, join.address)

    // The joins file can only be updated after the successful execution of the proposal
    fs.writeFileSync('./output/joins.json', mapToJson(joins), 'utf8')

    proposal.push({
      target: join.address,
      data: join.interface.encodeFunctionData('grantRoles', [
          [
              id(join.interface, 'setFlashFeeFactor(uint256)'),
          ],
          timelock.address
      ])
    })
    console.log(`join.grantRoles(gov, timelock)`)

    proposal.push({
      target: join.address,
      data: join.interface.encodeFunctionData('grantRole', [ROOT, cloak.address])
    })
    console.log(`join.grantRole(ROOT, cloak)`)

    proposal.push({
      target: cloak.address,
      data: cloak.interface.encodeFunctionData('plan', [ladle.address,
        [
          {
            contact: join.address, signatures: [
              id(join.interface, 'join(address,uint128)'),
              id(join.interface, 'exit(address,uint128)'),
            ]
          }
        ]
      ])
    })
    console.log(`cloak.plan(ladle, join(${bytesToString(assetId)}))`)
  }

  // Propose, approve, execute
  const txHash2 = await timelock.callStatic.propose(proposal)
  await timelock.propose(proposal); console.log(`Proposed ${txHash2}`)
  await timelock.approve(txHash2); console.log(`Approved ${txHash2}`)
  await timelock.execute(proposal); console.log(`Executed ${txHash2}`)

})()
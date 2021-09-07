/**
 * @dev This script adds one or more assets to the protocol.
 * 
 * It takes as inputs the governance, protocol, assets and joins json address files.
 * It uses the Wand to:
 *  - Add the asset to Cauldron.
 *  - Deploy a new Join, which gets added to the Ladle, which gets permissions to join and exit.
 * The Timelock and Cloak get ROOT access to the new Join. Root access is NOT removed from the Wand.
 * The Timelock gets access to governance functions in the new Join.
 * A plan is recorded in the Cloak to isolate the Join from the Ladle.
 * It adds to the assets and joins json address files.
 * @notice The assetIds can't be already in use
 */

import { ethers } from 'hardhat'
import *  as fs from 'fs'
import *  as hre from 'hardhat'
import { id } from '@yield-protocol/utils-v2'
import { bytesToString, stringToBytes6, mapToJson, jsonToMap, verify } from '../shared/helpers'
import { DAI, USDC, ETH, WBTC, USDT, CDAI, CUSDC, CUSDT } from '../shared/constants'

import { Ladle } from '../typechain/Ladle'
import { Wand } from '../typechain/Wand'
import { Join } from '../typechain/Join'

import { Timelock } from '../typechain/Timelock'
import { Relay } from '../typechain/Relay'
import { EmergencyBrake } from '../typechain/EmergencyBrake'

(async () => {
  // Input data
  const newAssets: Array<[string, string]> = [
    [DAI,  "0xaFCdc724EB8781Ee721863db1B15939675996484"],
    [USDC, "0xeaCB3AAB4CA68F1e6f38D56bC5FCc499B76B4e2D"],
    [ETH,  "0x55C0458edF1D8E07DF9FB44B8960AecC515B4492"],
    [WBTC, "0xD5FafCE68897bdb55fA11Dd77858Df7a9a458D92"],
    [USDT, "0x233551369dc535f5fF3517c28fDCce81d650063e"],
    [CDAI,  "0xf0d0eb522cfa50b716b3b1604c4f0fa6f04376ad"],
    [CUSDC, "0x4a92e71227d294f041bd82dd8f78591b75140d63"],
    [CUSDT, "0x3f0a0ea2f86bae6362cf9799b523ba06647da018"],
    // [stringToBytes6('TST3'), "0xfaAddC93baf78e89DCf37bA67943E1bE8F37Bb8c"],
  ] // Adding 6 assets is 10 million gas, approaching the block gas limit here
  /* await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: ["0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5"],
  });
  const ownerAcc = await ethers.getSigner("0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5") */
  const [ ownerAcc ] = await ethers.getSigners();
  const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string, string>;
  const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string,string>;
  const assets = jsonToMap(fs.readFileSync('./output/assets.json', 'utf8')) as Map<string, string>;
  const joins = jsonToMap(fs.readFileSync('./output/joins.json', 'utf8')) as Map<string, string>;

  // Contract instantiation
  const ladle = await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc) as unknown as Ladle
  const wand = await ethers.getContractAt('Wand', protocol.get('wand') as string, ownerAcc) as unknown as Wand
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc) as unknown as Timelock
  const relay = await ethers.getContractAt('Relay', governance.get('relay') as string, ownerAcc) as unknown as Relay
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


  // Propose, approve, execute
  const txHash = await timelock.callStatic.propose(proposal)
  await relay.execute(
    [
      {
        target: timelock.address,
        data: timelock.interface.encodeFunctionData('propose', [proposal])
      },
      {
        target: timelock.address,
        data: timelock.interface.encodeFunctionData('approve', [txHash])
      },
      {
        target: timelock.address,
        data: timelock.interface.encodeFunctionData('execute', [proposal])
      },
    ]
  ); console.log(`Executed ${txHash}`)
  // await timelock.propose(proposal); console.log(`Proposed ${txHash}`)
  // await timelock.approve(txHash); console.log(`Approved ${txHash}`)
  // await timelock.execute(proposal); console.log(`Executed ${txHash}`)
  fs.writeFileSync('./output/assets.json', mapToJson(assets), 'utf8')

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
  await relay.execute(
    [
      {
        target: timelock.address,
        data: timelock.interface.encodeFunctionData('propose', [proposal])
      },
      {
        target: timelock.address,
        data: timelock.interface.encodeFunctionData('approve', [txHash2])
      },
      {
        target: timelock.address,
        data: timelock.interface.encodeFunctionData('execute', [proposal])
      },
    ]
  ); console.log(`Executed ${txHash2}`)
  // await timelock.propose(proposal); console.log(`Proposed ${txHash2}`)
  // await timelock.approve(txHash); console.log(`Approved ${txHash2}`)
  // await timelock.execute(proposal); console.log(`Executed ${txHash2}`)

})()
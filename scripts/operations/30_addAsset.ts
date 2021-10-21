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
import * as fs from 'fs'
import * as hre from 'hardhat'
import { id } from '@yield-protocol/utils-v2'
import { bytesToString, stringToBytes6, mapToJson, jsonToMap, verify } from '../../shared/helpers'
import { DAI, USDC, ETH, WBTC, USDT, CDAI, CUSDC, CUSDT } from '../../shared/constants'

import { Ladle } from '../../typechain/Ladle'
import { Wand } from '../../typechain/Wand'
import { Join } from '../../typechain/Join'

import { Timelock } from '../../typechain/Timelock'
import { ERC20Mock } from '../../typechain/ERC20Mock'
import { EmergencyBrake } from '../../typechain/EmergencyBrake'

;(async () => {
  // Input data
  const newAssets: Array<[string, string]> = [
    [ETH, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'],
    [DAI, '0x6B175474E89094C44Da98b954EedeAC495271d0F'],
    [USDC, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'],
    [WBTC, '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'],
  ] // Adding 6 assets is 10 million gas, approaching the block gas limit here
  /* await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: ["0xA072f81Fea73Ca932aB2B5Eda31Fa29306D58708"],
  });
  const ownerAcc = await ethers.getSigner("0xA072f81Fea73Ca932aB2B5Eda31Fa29306D58708") */
  const [ownerAcc] = await ethers.getSigners()

  const governance = jsonToMap(fs.readFileSync('./addresses/governance.json', 'utf8')) as Map<string, string>
  const protocol = jsonToMap(fs.readFileSync('./addresses/protocol.json', 'utf8')) as Map<string, string>
  const assets = jsonToMap(fs.readFileSync('./addresses/assets.json', 'utf8')) as Map<string, string>
  const joins = jsonToMap(fs.readFileSync('./addresses/joins.json', 'utf8')) as Map<string, string>

  // Contract instantiation
  const ladle = (await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as unknown as Ladle
  const wand = (await ethers.getContractAt('Wand', protocol.get('wand') as string, ownerAcc)) as unknown as Wand
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock
  const cloak = (await ethers.getContractAt(
    'EmergencyBrake',
    governance.get('cloak') as string,
    ownerAcc
  )) as unknown as EmergencyBrake
  const ROOT = await timelock.ROOT()

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []
  for (let [assetId, assetAddress] of newAssets) {
    const asset = (await ethers.getContractAt('ERC20Mock', assetAddress as string, ownerAcc)) as unknown as ERC20Mock
    console.log(`Using ${await asset.name()} at ${assetAddress}`)

    proposal.push({
      target: wand.address,
      data: wand.interface.encodeFunctionData('addAsset', [assetId, assetAddress]),
    })
    console.log(`[Asset: ${bytesToString(assetId)}: ${assetAddress}],`)
    assets.set(assetId, assetAddress)
  }

  // Propose, approve, execute
  let txHash = await timelock.hash(proposal)
  console.log(`Proposal: ${txHash}`)
  if ((await timelock.proposals(txHash)).state === 0) {
    await timelock.propose(proposal)
    console.log(`Proposed ${txHash}`)
    while ((await timelock.proposals(txHash)).state < 1) {}
  }
  if ((await timelock.proposals(txHash)).state === 1) {
    await timelock.approve(txHash)
    console.log(`Approved ${txHash}`)
    while ((await timelock.proposals(txHash)).state < 2) {}
  }
  if ((await timelock.proposals(txHash)).state === 2) {
    await timelock.execute(proposal)
    console.log(`Executed ${txHash}`)
    while ((await timelock.proposals(txHash)).state > 0) {}
  }

  fs.writeFileSync('./addresses/assets.json', mapToJson(assets), 'utf8')

  // Give access to each of the Join governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, Timelock already has ROOT as the deployer
  // Store a plan for isolating Join from Ladle and Witch
  proposal = []

  for (let [assetId, assetAddress] of newAssets) {
    const join = (await ethers.getContractAt('Join', await ladle.joins(assetId), ownerAcc)) as Join
    verify(join.address, [assetAddress])
    console.log(`[${bytesToString(assetId)}Join, : '${join.address}'],`)
    joins.set(assetId, join.address)

    // The joins file can only be updated after the successful execution of the proposal
    fs.writeFileSync('./addresses/joins.json', mapToJson(joins), 'utf8')

    proposal.push({
      target: join.address,
      data: join.interface.encodeFunctionData('grantRoles', [
        [id(join.interface, 'setFlashFeeFactor(uint256)')],
        timelock.address,
      ]),
    })
    console.log(`join.grantRoles(gov, timelock)`)

    proposal.push({
      target: join.address,
      data: join.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
    })
    console.log(`join.grantRole(ROOT, cloak)`)

    const plan = [
      {
        contact: join.address,
        signatures: [id(join.interface, 'join(address,uint128)'), id(join.interface, 'exit(address,uint128)')],
      },
    ]

    proposal.push({
      target: cloak.address,
      data: cloak.interface.encodeFunctionData('plan', [ladle.address, plan]),
    })
    console.log(`cloak.plan(ladle, join(${bytesToString(assetId)})): ${await cloak.hash(ladle.address, plan)}`)
  }

  // Propose, approve, execute
  txHash = await timelock.hash(proposal)
  console.log(`Proposal: ${txHash}`)
  if ((await timelock.proposals(txHash)).state === 0) {
    await timelock.propose(proposal)
    console.log(`Proposed ${txHash}`)
    while ((await timelock.proposals(txHash)).state < 1) {}
  }
  if ((await timelock.proposals(txHash)).state === 1) {
    await timelock.approve(txHash)
    console.log(`Approved ${txHash}`)
    while ((await timelock.proposals(txHash)).state < 2) {}
  }
  if ((await timelock.proposals(txHash)).state === 2) {
    await timelock.execute(proposal)
    console.log(`Executed ${txHash}`)
    while ((await timelock.proposals(txHash)).state > 0) {}
  }
})()
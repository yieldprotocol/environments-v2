/**
 * @dev This script adds one or more series to the protocol.
 *
 * It takes as inputs the governance and protocol json address files.
 * It uses the Wand to add the series:
 *  - Deploying a fyToken and adds it to the Cauldron, permissioned for the specified ilks.
 *  - Deploying a pool and adding it to the Ladle, which gets permissions to mint and burn.
 * The Timelock and Cloak get ROOT access to the new FYToken. Root access is NOT removed from the Wand.
 * The Timelock gets access to governance functions in the new FYToken.
 * A plan is recorded in the Cloak to isolate the FYToken from the Ladle.
 * It adds to the fyTokens and pools json address files.
 * @notice Adding one series is 6M gas, maybe add just one per proposal
 */

import { ethers } from 'hardhat'
import * as hre from 'hardhat'
import * as fs from 'fs'
import { id } from '@yield-protocol/utils-v2'
import { bytesToString, stringToBytes6, mapToJson, jsonToMap, verify } from '../../shared/helpers'
import { DAI, USDC, ETH, WBTC, ZERO_ADDRESS } from '../../shared/constants'

import { Cauldron } from '../../typechain/Cauldron'
import { Ladle } from '../../typechain/Ladle'
import { Wand } from '../../typechain/Wand'
import { Join } from '../../typechain/Join'
import { FYToken } from '../../typechain/FYToken'
import { Pool } from '../../typechain/Pool'

import { Timelock } from '../../typechain/Timelock'
import { Relay } from '../../typechain/Relay'
import { EmergencyBrake } from '../../typechain/EmergencyBrake'

;(async () => {
  // Input data
  const EODEC21 = 1640919600
  const EOMAR22 = 1648177200

  const newSeries: Array<[string, string, number, string[], string, string]> = [
    [stringToBytes6('0104'), DAI, EODEC21, [ETH, DAI, USDC, WBTC], 'FYDAI2112', 'FYDAI2112'], // Dec21
    [stringToBytes6('0105'), DAI, EOMAR22, [ETH, DAI, USDC, WBTC], 'FYDAI2203', 'FYDAI2203'], // Mar22
    [stringToBytes6('0204'), USDC, EODEC21, [ETH, DAI, USDC, WBTC], 'FYUSDC2112', 'FYUSDC2112'],
    [stringToBytes6('0205'), USDC, EOMAR22, [ETH, DAI, USDC, WBTC], 'FYUSDC2203', 'FYUSDC2203'],
  ]
  /* await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: ["0xA072f81Fea73Ca932aB2B5Eda31Fa29306D58708"],
  });
  const ownerAcc = await ethers.getSigner("0xA072f81Fea73Ca932aB2B5Eda31Fa29306D58708") */
  const [ownerAcc] = await ethers.getSigners()

  const governance = jsonToMap(fs.readFileSync('./addresses/governance.json', 'utf8')) as Map<string, string>
  const protocol = jsonToMap(fs.readFileSync('./addresses/protocol.json', 'utf8')) as Map<string, string>
  const joins = jsonToMap(fs.readFileSync('./addresses/joins.json', 'utf8')) as Map<string, string>
  const fyTokens = jsonToMap(fs.readFileSync('./addresses/fyTokens.json', 'utf8')) as Map<string, string>
  const pools = jsonToMap(fs.readFileSync('./addresses/pools.json', 'utf8')) as Map<string, string>

  // Contract instantiation
  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron
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

  // Each series costs 10M gas to deploy, so there is no bundling of several series in a single proposal
  for (let [seriesId, baseId, maturity, ilkIds, name, symbol] of newSeries) {
    // Build the proposal
    let proposal: Array<{ target: string; data: string }> = []

    proposal.push({
      target: wand.address,
      data: wand.interface.encodeFunctionData('addSeries', [seriesId, baseId, maturity, ilkIds, name, symbol]),
    })

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

    // The fyToken and pools files can only be updated after the successful execution of the proposal
    const fyToken = (await ethers.getContractAt(
      'FYToken',
      (
        await cauldron.series(seriesId)
      ).fyToken,
      ownerAcc
    )) as FYToken
    console.log(`[${await fyToken.symbol()}, '${fyToken.address}'],`)
    verify(
      fyToken.address,
      [
        await fyToken.underlyingId(),
        await fyToken.oracle(),
        await fyToken.join(),
        await fyToken.maturity(),
        await fyToken.name(),
        await fyToken.symbol(),
      ],
      'safeERC20Namer.js'
    )
    fyTokens.set(seriesId, fyToken.address)
    fs.writeFileSync('./addresses/fyTokens.json', mapToJson(fyTokens), 'utf8')

    const pool = (await ethers.getContractAt('Pool', await ladle.pools(seriesId), ownerAcc)) as Pool
    console.log(`[${await fyToken.symbol()}Pool, '${pool.address}'],`)
    verify(pool.address, [], 'safeERC20Namer.js')
    pools.set(seriesId, pool.address)
    fs.writeFileSync('./addresses/pools.json', mapToJson(pools), 'utf8')

    // Give access to each of the fyToken governance functions to the timelock, through a proposal to bundle them
    // Give ROOT to the cloak, Timelock already has ROOT as the deployer
    // Store a plan for isolating FYToken from Ladle and Base Join
    proposal = []

    const join = (await ethers.getContractAt('Join', joins.get(baseId) as string, ownerAcc)) as Join

    proposal.push({
      target: fyToken.address,
      data: fyToken.interface.encodeFunctionData('grantRoles', [
        [id(fyToken.interface, 'point(bytes32,address)')],
        timelock.address,
      ]),
    })
    console.log(`fyToken.grantRoles(gov, timelock)`)

    proposal.push({
      target: fyToken.address,
      data: fyToken.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
    })
    console.log(`fyToken.grantRole(ROOT, cloak)`)

    const ladlePlan = [
      {
        contact: fyToken.address,
        signatures: [id(fyToken.interface, 'mint(address,uint256)'), id(fyToken.interface, 'burn(address,uint256)')],
      },
    ]

    proposal.push({
      target: cloak.address,
      data: cloak.interface.encodeFunctionData('plan', [ladle.address, ladlePlan]),
    })
    console.log(`cloak.plan(ladle, fyToken(${bytesToString(seriesId)})): ${await cloak.hash(ladle.address, ladlePlan)}`)

    const joinPlan = [
      {
        contact: join.address,
        signatures: [id(join.interface, 'join(address,uint128)'), id(join.interface, 'exit(address,uint128)')],
      },
    ]

    proposal.push({
      target: cloak.address,
      data: cloak.interface.encodeFunctionData('plan', [fyToken.address, joinPlan]),
    })
    console.log(`cloak.plan(fyToken, join(${bytesToString(baseId)})): ${await cloak.hash(fyToken.address, joinPlan)}`)

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
  }
})()
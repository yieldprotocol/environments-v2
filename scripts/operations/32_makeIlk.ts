/**
 * @dev This script makes one or more assets into ilks for one or more bases.
 *
 * It takes as inputs the governance and protocol address files.
 * It uses the Wand to set the spot oracle, debt limits, and allow the Witch to liquidate collateral.
 * A plan is recorded in the Cloak to isolate the Join from the Witch.
 */

import { ethers } from 'hardhat'
import * as fs from 'fs'
import * as hre from 'hardhat'
import { id } from '@yield-protocol/utils-v2'
import { bytesToString, stringToBytes6, bytesToBytes32, jsonToMap } from '../../shared/helpers'
import { WAD, DAI, USDC, ETH, WBTC, USDT, CDAI, CUSDC, CUSDT } from '../../shared/constants'

import { Witch } from '../../typechain/Witch'
import { Wand } from '../../typechain/Wand'
import { Join } from '../../typechain/Join'
import { ChainlinkMultiOracle } from '../../typechain/ChainlinkMultiOracle'

import { Timelock } from '../../typechain/Timelock'
import { Relay } from '../../typechain/Relay'
import { EmergencyBrake } from '../../typechain/EmergencyBrake'

;(async () => {
  const CHAINLINK = 'chainlinkOracle'
  const CTOKEN = 'cTokenOracle'
  const COMPOSITE = 'compositeOracle'
  // Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), inv(ratio), line, dust, dec
  const newIlks: Array<[string, string, string, number, number, number, number, number]> = [
    [DAI, ETH, CHAINLINK, 1400000, 714000, 100000, 1, 18],
    [DAI, DAI, CHAINLINK, 1000000, 1000000, 10000000, 0, 18], // Constant 1, no dust
    [DAI, USDC, CHAINLINK, 1330000, 751000, 100000, 1, 18], // Via ETH
    [DAI, WBTC, CHAINLINK, 1500000, 666000, 100000, 1, 18], // Via ETH
    [USDC, ETH, CHAINLINK, 1400000, 714000, 100000, 1, 6],
    [USDC, DAI, CHAINLINK, 1330000, 751000, 100000, 1, 6], // Via ETH
    [USDC, USDC, CHAINLINK, 1000000, 1000000, 10000000, 0, 6], // Constant 1, no dust
    [USDC, WBTC, CHAINLINK, 1500000, 666000, 100000, 1, 6], // Via ETH
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

  // Contract instantiation
  const witch = (await ethers.getContractAt('Witch', protocol.get('witch') as string, ownerAcc)) as unknown as Witch
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

  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []
  const plans: Array<string> = new Array() // Existing plans in the cloak
  for (let [baseId, ilkId, oracleName, ratio, invRatio, line, dust, dec] of newIlks) {
    const join = (await ethers.getContractAt('Join', joins.get(ilkId) as string, ownerAcc)) as Join

    // Test that the sources for spot have been set. Peek will fail with 'Source not found' if they have not.
    const spotOracle = (await ethers.getContractAt(
      'ChainlinkMultiOracle',
      protocol.get(oracleName) as string,
      ownerAcc
    )) as unknown as ChainlinkMultiOracle
    console.log(`Looking for ${bytesToString(baseId)}/${bytesToString(ilkId)} at ${protocol.get(oracleName) as string}`)
    // console.log(`Source for ${bytesToString(baseId)}/ETH: ${await spotOracle.sources(baseId, ETH)}`)
    // console.log(`Source for ${bytesToString(ilkId)}/ETH: ${await spotOracle.sources(ilkId, ETH)}`)
    console.log(
      `Current SPOT for ${bytesToString(baseId)}/${bytesToString(ilkId)}: ${
        (await spotOracle.callStatic.get(bytesToBytes32(baseId), bytesToBytes32(ilkId), WAD))[0]
      }`
    )

    if (!plans.includes(ilkId) && !((await witch.limits(ilkId)).line.toString() !== '0')) {
      proposal.push({
        target: witch.address,
        data: witch.interface.encodeFunctionData('setIlk', [
          ilkId,
          60 * 60,
          invRatio,
          line,
          dust,
          dec, // ilkId, duration, initialOffer, line, dust, dec
        ]),
      })
      console.log(`[Asset: ${bytesToString(ilkId)} set as ilk on witch at ${witch.address}],`)
    }

    proposal.push({
      target: wand.address,
      data: wand.interface.encodeFunctionData('makeIlk', [baseId, ilkId, spotOracle.address, ratio, line, dust, dec]),
    })
    console.log(`[Asset: ${bytesToString(ilkId)} made into ilk for ${bytesToString(baseId)}],`)

    if (!plans.includes(ilkId) && !((await witch.limits(ilkId)).line.toString() !== '0')) {
      const plan = [
        {
          contact: join.address,
          signatures: [id(join.interface, 'exit(address,uint128)')],
        },
      ]

      proposal.push({
        target: cloak.address,
        data: cloak.interface.encodeFunctionData('plan', [protocol.get('witch') as string, plan]),
      })
      console.log(
        `cloak.plan(witch, join(${bytesToString(ilkId)})): ${await cloak.hash(protocol.get('witch') as string, plan)}`
      )

      plans.push(ilkId)
    }
  }

  // Propose, approve, execute
  const txHash = await timelock.hash(proposal)
  console.log(`Proposal: ${txHash}`)
  if ((await timelock.proposals(txHash)).state === 0) {
    await timelock.propose(proposal)
    while ((await timelock.proposals(txHash)).state < 1) {}
    console.log(`Proposed ${txHash}`)
  }
  if ((await timelock.proposals(txHash)).state === 1) {
    await timelock.approve(txHash)
    while ((await timelock.proposals(txHash)).state < 2) {}
    console.log(`Approved ${txHash}`)
  }
  if ((await timelock.proposals(txHash)).state === 2) {
    await timelock.execute(proposal)
    while ((await timelock.proposals(txHash)).state > 0) {}
    console.log(`Executed ${txHash}`)
  }
})()

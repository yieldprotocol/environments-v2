/**
 * @dev This script updates the spot oracles and ratios for one or more base/ilk pairs. It updates the witch with the inverse collateralization ratio.
 *
 * It takes as inputs the governance and protocol address files.
 */

import { ethers } from 'hardhat'
import * as hre from 'hardhat'
import * as fs from 'fs'
import { stringToBytes6, bytesToString, bytesToBytes32, jsonToMap } from '../shared/helpers'
import { WAD, ETH, DAI, USDC, WBTC, USDT } from '../shared/constants'

import { Cauldron } from '../typechain/Cauldron'
import { Witch } from '../typechain/Witch'
import { IOracle } from '../typechain/IOracle'
import { ChainlinkMultiOracle } from '../typechain/ChainlinkMultiOracle'
import { Timelock } from '../typechain/Timelock'

;(async () => {
  const CHAINLINK = 'chainlinkOracle'
  const COMPOSITE = 'compositeOracle'

  // Input data: baseId, ilkId, oracle, ratio, invRatio
  const newSpotOracles: Array<[string, string, string, number, number]> = [
    [DAI, ETH, CHAINLINK, 1400000, 714000],
    [DAI, DAI, CHAINLINK, 1000000, 1000000], // Constant 1, no dust
    [DAI, USDC, CHAINLINK, 1330000, 751000], // Via ETH
    [DAI, WBTC, CHAINLINK, 1500000, 666000], // Via ETH
    [USDC, ETH, CHAINLINK, 1400000, 714000],
    [USDC, DAI, CHAINLINK, 1330000, 751000], // Via ETH
    [USDC, USDC, CHAINLINK, 1000000, 1000000], // Constant 1, no dust
    [USDC, WBTC, CHAINLINK, 1500000, 666000], // Via ETH
  ]

  /* await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: ["0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5"],
  });
  const ownerAcc = await ethers.getSigner("0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5") */
  const [ownerAcc] = await ethers.getSigners()
  const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string, string>
  const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string, string>

  // Contract instantiation
  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron
  const witch = (await ethers.getContractAt('Witch', protocol.get('witch') as string, ownerAcc)) as unknown as Witch
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []
  for (let [baseId, ilkId, oracleName, ratio, invRatio] of newSpotOracles) {
    // Test that the sources for spot have been set. Peek will fail with 'Source not found' if they have not.
    const spotOracle = (await ethers.getContractAt(
      'ChainlinkMultiOracle',
      protocol.get(oracleName) as string,
      ownerAcc
    )) as unknown as ChainlinkMultiOracle
    console.log(`Looking for ${baseId}/${ilkId} at ${protocol.get(oracleName) as string}`)
    console.log(
      `Source for ${bytesToString(baseId)}/${bytesToString(ilkId)}: ${await spotOracle.sources(baseId, ilkId)}`
    )
    console.log(
      `Current SPOT for ${bytesToString(baseId)}/${bytesToString(ilkId)}: ${
        (await spotOracle.callStatic.get(bytesToBytes32(baseId), bytesToBytes32(ilkId), WAD))[0]
      }`
    )

    proposal.push({
      target: cauldron.address,
      data: cauldron.interface.encodeFunctionData('setSpotOracle', [baseId, ilkId, spotOracle.address, ratio]),
    })
    console.log(
      `Pair ${bytesToString(baseId)}/${bytesToString(ilkId)} set in Cauldron via ${
        spotOracle.address
      } with ratio ${ratio}`
    )

    const witchIlk = await witch.ilks(ilkId)
    const cauldronDebt = await cauldron.debt(baseId, ilkId)

    proposal.push({
      target: witch.address,
      data: witch.interface.encodeFunctionData('setIlk', [
        ilkId,
        witchIlk.duration,
        invRatio,
        cauldronDebt.min * cauldronDebt.dec, // ilkId, duration, initialOffer, dust
      ]),
    })
    console.log(`Asset: ${bytesToString(ilkId)} set as ilk on witch at ${witch.address},`)
  }

  // Propose, approve, execute
  /* const txHash = await timelock.hash(proposal); console.log(`Proposal: ${txHash}`)
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
  } */
})()

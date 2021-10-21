/**
 * @dev This script updates the spot oracles and ratios for one or more base/ilk pairs.
 *
 * It takes as inputs the governance and protocol address files.
 */

import { ethers } from 'hardhat'
import * as fs from 'fs'
import { stringToBytes6, bytesToString, bytesToBytes32, jsonToMap } from '../shared/helpers'
import { WAD, ETH, DAI, USDC, WBTC, USDT } from '../shared/constants'

import { Cauldron } from '../typechain/Cauldron'
import { IOracle } from '../typechain/IOracle'
import { CompoundMultiOracle } from '../typechain/CompoundMultiOracle'
import { Timelock } from '../typechain/Timelock'

;(async () => {
  const COMPOUND = 'compoundOracle'
  const RATE = stringToBytes6('rate')
  const CHI = stringToBytes6('chi')

  // Input data: baseId, oracleName
  const newRateChiOracles: Array<[string, string]> = [
    [DAI, COMPOUND],
    [USDC, COMPOUND],
    [USDT, COMPOUND],
  ]

  const [ownerAcc] = await ethers.getSigners()
  const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string, string>
  const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string, string>

  // Contract instantiation
  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []
  for (let [baseId, oracleName] of newRateChiOracles) {
    // Test that the sources for rate have been set. Peek will fail with 'Source not found' if they have not.
    const lendingOracle = (await ethers.getContractAt(
      'CompoundMultiOracle',
      protocol.get(oracleName) as string,
      ownerAcc
    )) as unknown as CompoundMultiOracle
    console.log(`Looking for the ${bytesToString(baseId)} rate and chi at ${protocol.get(oracleName) as string}`)
    console.log(`Source for the ${bytesToString(baseId)} rate: ${await lendingOracle.sources(baseId, RATE)}`)
    console.log(`Source for the ${bytesToString(baseId)} chi: ${await lendingOracle.sources(baseId, CHI)}`)
    console.log(
      `Current rate for ${bytesToString(baseId)}: ${
        (await lendingOracle.peek(bytesToBytes32(baseId), bytesToBytes32(RATE), WAD))[0]
      }`
    )
    console.log(
      `Current chi for ${bytesToString(baseId)}: ${
        (await lendingOracle.peek(bytesToBytes32(baseId), bytesToBytes32(CHI), WAD))[0]
      }`
    )

    proposal.push({
      target: cauldron.address,
      data: cauldron.interface.encodeFunctionData('setLendingOracle', [baseId, lendingOracle.address]),
    })
    console.log(`cauldron.setLendingOracle(${bytesToString(baseId)}): ${lendingOracle.address}`)
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

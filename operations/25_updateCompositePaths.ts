/**
 * @dev This script replaces one or more data paths in a CompositeMultiOracle.
 * These data paths are assets that will be used as base and quote of an iteratively calculated price.
 *
 * It takes as inputs the governance and protocol json address files.
 */

import { ethers } from 'hardhat'
import * as fs from 'fs'
import { bytesToString, jsonToMap } from '../shared/helpers'
import { DAI, ETH, USDC, USDT, WBTC } from '../shared/constants'

import { CompositeMultiOracle } from '../typechain/CompositeMultiOracle'
import { Timelock } from '../typechain/Timelock'

;(async () => {
  // Input data: baseId, quoteId, intermediate steps
  const newCompositePaths: Array<[string, string, Array<string>]> = [
    // The Composite oracle is not needed anymore for combining two Chainlink sources through ETH
    // This script will be needed for adding cToken as collateral to do cDai -> Dai -> Other
    /* [DAI, USDC, [ETH]],
    [DAI, USDT, [ETH]],
    [DAI, WBTC, [ETH]],
    [USDC, DAI, [ETH]],
    [USDC, USDT, [ETH]],
    [USDC, WBTC, [ETH]],
    [USDT, DAI, [ETH]],
    [USDT, USDC, [ETH]],
    [USDT, WBTC, [ETH]] */
  ]

  const [ownerAcc] = await ethers.getSigners()
  const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string, string>
  const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string, string>

  // Contract instantiation
  const compositeOracle = (await ethers.getContractAt(
    'CompositeMultiOracle',
    protocol.get('compositeOracle') as string,
    ownerAcc
  )) as unknown as CompositeMultiOracle
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  // Build proposal
  const proposal: Array<{ target: string; data: string }> = []
  for (let [baseId, quoteId, path] of newCompositePaths) {
    proposal.push({
      target: compositeOracle.address,
      data: compositeOracle.interface.encodeFunctionData('setPath', [baseId, quoteId, path]),
    })
    console.log(`[path: ${bytesToString(baseId)}/${bytesToString(quoteId)} -> ${path}],`)
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

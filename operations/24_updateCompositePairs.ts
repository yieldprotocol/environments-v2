/**
 * @dev This script replaces one or more data sources in a CompositeMultiOracle.
 * These data sources are IOracle contracts that will be used either directly or as part of paths.
 * 
 * It takes as inputs the governance and protocol json address files.
 */

import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { bytesToString, jsonToMap } from '../shared/helpers'
import { DAI, ETH, USDC, USDT, WBTC } from '../shared/constants'

import { CompositeMultiOracle } from '../typechain/CompositeMultiOracle'
import { Timelock } from '../typechain/Timelock'

(async () => {
  // Input data: baseId, quoteId, oracle name
  const newCompositePairs: Array<[string, string, string]> = [
    // The Composite oracle is not needed anymore for combining two Chainlink sources through ETH
    // This script would be needed for adding cToken as collateral to do cDai -> Dai -> Other
    /*[DAI, ETH, 'chainlinkOracle'],
    [USDC, ETH, 'chainlinkOracle'],
    [USDT, ETH, 'chainlinkOracle'],
    [WBTC, ETH, 'chainlinkOracle'],*/
  ]

  const [ ownerAcc ] = await ethers.getSigners();
  const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string, string>;
  const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string,string>;

  // Contract instantiation
  const compositeOracle = await ethers.getContractAt('CompositeMultiOracle', protocol.get('compositeOracle') as string, ownerAcc) as unknown as CompositeMultiOracle
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc) as unknown as Timelock

  // Build proposal
  const proposal : Array<{ target: string; data: string}> = []
  for (let [baseId, quoteId, oracleName] of newCompositePairs) {
    proposal.push({
      target: compositeOracle.address,
      data: compositeOracle.interface.encodeFunctionData("setSource", [baseId, quoteId, protocol.get(oracleName) as string])
    })
    console.log(`[pair: ${bytesToString(baseId)}/${bytesToString(quoteId)} -> ${protocol.get(oracleName) as string}],`)
  }

  // Propose, approve, execute
  const txHash = await timelock.hash(proposal); console.log(`Proposal: ${txHash}`)
  if ((await timelock.proposals(txHash)).state === 0) { 
    await timelock.propose(proposal); console.log(`Queued proposal for ${txHash}`) 
    while ((await timelock.proposals(txHash)).state < 1) { }; console.log(`Proposed ${txHash}`) 
  }
  if ((await timelock.proposals(txHash)).state === 1) {
    await timelock.approve(txHash); console.log(`Queued approval for ${txHash}`)
    while ((await timelock.proposals(txHash)).state < 2) { }; console.log(`Approved ${txHash}`)
  }
  if ((await timelock.proposals(txHash)).state === 2) { 
    await timelock.execute(proposal); console.log(`Queued execution for ${txHash}`) 
    while ((await timelock.proposals(txHash)).state > 0) { }; console.log(`Executed ${txHash}`) 
  }
})()
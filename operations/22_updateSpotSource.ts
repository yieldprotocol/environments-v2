/**
 * @dev This script replaces one or more spot data sources in a MultiOracle.
 * 
 * It takes as inputs the governance, protocol and spotSources json address files.
 * It rewrites the spotSources json address file.
 * @notice This can be used to update RATE and CHI by entering those as quoteId, and using a rate and chi oracle
 */

import { ethers } from 'hardhat'
import *  as fs from 'fs'
import *  as hre from 'hardhat'
import { stringToBytes6, bytesToString, bytesToBytes32, mapToJson, jsonToMap } from '../shared/helpers'
import { WAD, DAI, ETH, USDC, USDT, WBTC } from '../shared/constants'

import { ChainlinkMultiOracle } from '../typechain/ChainlinkMultiOracle' // TODO: Change to IOracleGov
import { Timelock } from '../typechain/Timelock'

(async () => {
  const CHAINLINK = 'chainlinkOracle'
  const UNISWAP = 'uniswapOracle'
  // Input data: baseId, quoteId, oracle name, source address
  const newSources: Array<[string, string, string, string]> = [
    [DAI, ETH,   CHAINLINK, "0x773616E4d11A78F511299002da57A0a94577F1f4"],
    [USDC, ETH,  CHAINLINK, "0x986b5E1e1755e3C2440e960477f25201B0a8bbD4"],
    [WBTC, ETH,  CHAINLINK, "0xdeb288F737066589598e9214E782fa5A8eD689e8"]
  ]
  /* await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: ["0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5"],
  });
  const ownerAcc = await ethers.getSigner("0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5") */
  const [ ownerAcc ] = await ethers.getSigners();
  const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string, string>;
  const assets = jsonToMap(fs.readFileSync('./output/assets.json', 'utf8')) as Map<string,string>;
  const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string,string>;
  const spotSources = jsonToMap(fs.readFileSync('./output/spotSources.json', 'utf8')) as Map<string, string>;

  // Contract instantiation
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc) as unknown as Timelock

  // Build proposal
  const proposal : Array<{ target: string; data: string}> = []
  for (let [baseId, quoteId, oracleName, sourceAddress] of newSources) {
    const pairId = `${baseId},${quoteId}`
    const oracle = await ethers.getContractAt('ChainlinkMultiOracle', protocol.get(oracleName) as string, ownerAcc) as unknown as ChainlinkMultiOracle
    console.log(`oracle: ${oracle.address}],`)

    proposal.push({
      target: oracle.address,
      data: oracle.interface.encodeFunctionData("setSource", [baseId, assets.get(baseId) as string, quoteId, assets.get(quoteId) as string, sourceAddress])
    })
    console.log(`[spot: ${bytesToString(baseId)}/${bytesToString(quoteId)}: ${spotSources.get(pairId) || undefined} -> ${sourceAddress}],`)
    spotSources.set(pairId, sourceAddress)
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

  fs.writeFileSync('./output/spotSources.json', mapToJson(spotSources), 'utf8')
})()

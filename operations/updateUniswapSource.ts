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

import { UniswapV3Oracle } from '../typechain/UniswapV3Oracle' // TODO: Change to IOracleGov
import { Timelock } from '../typechain/Timelock'

(async () => {
  const CHAINLINK = 'chainlinkOracle'
  const UNISWAP = 'uniswapOracle'
  // Input data: baseId, quoteId, oracle name, source address
  const newSources: Array<[string, string, string, string]> = [
    // [DAI, stringToBytes6('TST1'), 'chainlinkOracle', "0xF32D39ff9f6Aa7a7A64d7a4F00a54826Ef791a55"],
    [DAI, ETH,   UNISWAP, "0x77BAEEB630da5bc5DabdBd15eeB84A37E473fFb3"],
    [USDC, ETH,  UNISWAP, "0xf43261E862FF94B45600d62444dEF3AB94f2a745"],
    [ETH, WBTC,  UNISWAP, "0x6d2ff6bafb5777fed4bb73d4892ad00085a9e532"],
    // [DAI, USDC,   UNISWAP, "0x22B58f1EbEDfCA50feF632bD73368b2FdA96D541"],
    // [DAI, WBTC,  UNISWAP, "0x64EaC61A2DFda2c3Fa04eED49AA33D021AeC8838"],
    // [USDC, WBTC,  UNISWAP, "0xF7904a295A029a3aBDFFB6F12755974a958C7C25"]
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
    const oracle = await ethers.getContractAt('UniswapV3Oracle', protocol.get(oracleName) as string, ownerAcc) as unknown as UniswapV3Oracle
    console.log(`oracle: ${oracle.address}],`)

    proposal.push({
      target: oracle.address,
      data: oracle.interface.encodeFunctionData("setSource", [baseId, quoteId, sourceAddress])
    })
    console.log(`[spot: ${bytesToString(baseId)}/${bytesToString(quoteId)}: ${spotSources.get(pairId) || undefined} -> ${sourceAddress}],`)
    spotSources.set(pairId, sourceAddress)
  }

  // Propose, approve, execute
  const txHash = await timelock.hash(proposal); console.log(`Proposal: ${txHash}`)
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
  }

  fs.writeFileSync('./output/spotSources.json', mapToJson(spotSources), 'utf8')
})()

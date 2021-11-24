/**
 * @dev This script replaces one or more spot data sources in a MultiOracle.
 *
 * It takes as inputs the governance, protocol and spotSources json address files.
 * It rewrites the spotSources json address file.
 * @notice This can be used to update RATE and CHI by entering those as quoteId, and using a rate and chi oracle
 */

import { ethers } from 'hardhat'
import * as fs from 'fs'
import * as hre from 'hardhat'
import { stringToBytes6, bytesToString, bytesToBytes32, mapToJson, jsonToMap } from '../../shared/helpers'
import { WAD, DAI, ETH, USDC, WBTC } from '../../shared/constants'

import { ChainlinkMultiOracle } from '../../typechain/ChainlinkMultiOracle' // TODO: Change to IOracleGov
import { ChainlinkAggregatorV3Mock } from '../../typechain/ChainlinkAggregatorV3Mock'
import { Timelock } from '../../typechain/Timelock'

;(async () => {
  const CHAINLINK = 'chainlinkOracle'
  const UNISWAP = 'uniswapOracle'
  // Input data: baseId, quoteId, oracle name, source address
  const newSources: Array<[string, string, string, string]> = [
    // [DAI, stringToBytes6('TST1'), 'chainlinkOracle', "0xF32D39ff9f6Aa7a7A64d7a4F00a54826Ef791a55"],
    [DAI, ETH, CHAINLINK,  '0x22B58f1EbEDfCA50feF632bD73368b2FdA96D541'],
    [USDC, ETH, CHAINLINK, '0x64EaC61A2DFda2c3Fa04eED49AA33D021AeC8838'],
    [WBTC, ETH, CHAINLINK, '0xF7904a295A029a3aBDFFB6F12755974a958C7C25'],
  ]
  /* await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: ["0xA072f81Fea73Ca932aB2B5Eda31Fa29306D58708"],
  });
  const ownerAcc = await ethers.getSigner("0xA072f81Fea73Ca932aB2B5Eda31Fa29306D58708") */
  const [ownerAcc] = await ethers.getSigners()

  const governance = jsonToMap(fs.readFileSync('./addresses/governance.json', 'utf8')) as Map<string, string>
  const assets = jsonToMap(fs.readFileSync('./addresses/assets.json', 'utf8')) as Map<string, string>
  const protocol = jsonToMap(fs.readFileSync('./addresses/protocol.json', 'utf8')) as Map<string, string>
  const spotSources = jsonToMap(fs.readFileSync('./addresses/spotSources.json', 'utf8')) as Map<string, string>

  // Contract instantiation
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  // Build proposal
  const proposal: Array<{ target: string; data: string }> = []
  for (let [baseId, quoteId, oracleName, sourceAddress] of newSources) {
    if ((await ethers.provider.getCode(sourceAddress)) === '0x') throw `Address ${sourceAddress} contains no code`

    const pairId = `${baseId},${quoteId}`
    const oracle = (await ethers.getContractAt(
      'ChainlinkMultiOracle',
      protocol.get(oracleName) as string,
      ownerAcc
    )) as unknown as ChainlinkMultiOracle
    console.log(`oracle: ${oracle.address}],`)

    proposal.push({
      target: oracle.address,
      data: oracle.interface.encodeFunctionData('setSource', [
        baseId,
        assets.get(baseId) as string,
        quoteId,
        assets.get(quoteId) as string,
        sourceAddress,
      ]),
    })
    console.log(
      `[spot: ${bytesToString(baseId)}/${bytesToString(quoteId)}: ${
        spotSources.get(pairId) || undefined
      } -> ${sourceAddress}],`
    )
    spotSources.set(pairId, sourceAddress)
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

  fs.writeFileSync('./addresses/spotSources.json', mapToJson(spotSources), 'utf8')
})()

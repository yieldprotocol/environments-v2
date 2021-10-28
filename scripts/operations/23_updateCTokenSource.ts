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
import { DAI, CDAI, USDC, CUSDC, USDT, CUSDT } from '../../shared/constants'

import { CTokenMultiOracle } from '../../typechain/CTokenMultiOracle'
import { Timelock } from '../../typechain/Timelock'
import { Relay } from '../../typechain/Relay'

;(async () => {
  // Input data: baseId, quoteId, oracle name, source address
  const newSources: Array<[string, string, string, string]> = [
    // [DAI, stringToBytes6('TST1'), 'chainlinkOracle', "0xF32D39ff9f6Aa7a7A64d7a4F00a54826Ef791a55"],
    [CDAI, DAI, 'cTokenOracle', '0xf0d0eb522cfa50b716b3b1604c4f0fa6f04376ad'],
    [CUSDC, USDC, 'cTokenOracle', '0x4a92e71227d294f041bd82dd8f78591b75140d63'],
    [CUSDT, USDT, 'cTokenOracle', '0x3f0a0ea2f86bae6362cf9799b523ba06647da018'],
  ]

  /* await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: ["0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5"],
  });
  const ownerAcc = await ethers.getSigner("0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5") */
  const [ownerAcc] = await ethers.getSigners()
  const governance = jsonToMap(fs.readFileSync('./addresses/governance.json', 'utf8')) as Map<string, string>
  const assets = jsonToMap(fs.readFileSync('./addresses/assets.json', 'utf8')) as Map<string, string>
  const protocol = jsonToMap(fs.readFileSync('./addresses/protocol.json', 'utf8')) as Map<string, string>
  const cTokenSources = jsonToMap(fs.readFileSync('./addresses/cTokenSources.json', 'utf8')) as Map<string, string>

  // Contract instantiation
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  // Build proposal
  const proposal: Array<{ target: string; data: string }> = []
  for (let [baseId, quoteId, oracleName, sourceAddress] of newSources) {
    const pairId = `${baseId},${quoteId}`
    const oracle = (await ethers.getContractAt(
      'CTokenMultiOracle',
      protocol.get(oracleName) as string,
      ownerAcc
    )) as unknown as CTokenMultiOracle

    proposal.push({
      target: oracle.address,
      data: oracle.interface.encodeFunctionData('setSource', [baseId, quoteId, sourceAddress]),
    })
    console.log(
      `[spot: ${bytesToString(baseId)}/${bytesToString(quoteId)}: ${
        cTokenSources.get(pairId) || undefined
      } -> ${sourceAddress}],`
    )
    cTokenSources.set(pairId, sourceAddress)
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

  fs.writeFileSync('./addresses/cTokenSources.json', mapToJson(cTokenSources), 'utf8')
})()

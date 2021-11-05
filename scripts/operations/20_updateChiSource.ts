/**
 * @dev This script replaces one or more chi data sources in the CompoundMultiOracle.
 *
 * It takes as inputs the governance, protocol and chiSources json address files.
 * It rewrites the chiSources json address file.
 */

import { ethers } from 'hardhat'
import * as fs from 'fs'
import * as hre from 'hardhat'
import { stringToBytes6, bytesToString, mapToJson, jsonToMap } from '../../shared/helpers'
import { CHI, DAI, USDC, USDT } from '../../shared/constants'

import { CompoundMultiOracle } from '../../typechain/CompoundMultiOracle'
import { ERC20Mock } from '../../typechain/ERC20Mock'
import { Timelock } from '../../typechain/Timelock'

;(async () => {
  // Input data
  const newSources: Array<[string, string]> = [
    [DAI,  '0xf0d0eb522cfa50b716b3b1604c4f0fa6f04376ad'],
    [USDC, '0x4a92e71227d294f041bd82dd8f78591b75140d63'],
    // [stringToBytes6('TST3'), "0x8A93d247134d91e0de6f96547cB0204e5BE8e5D8"],
  ]

  /* await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: ["0xA072f81Fea73Ca932aB2B5Eda31Fa29306D58708"],
  });
  const ownerAcc = await ethers.getSigner("0xA072f81Fea73Ca932aB2B5Eda31Fa29306D58708") */
  const [ownerAcc] = await ethers.getSigners()

  const governance = jsonToMap(fs.readFileSync('./addresses/governance.json', 'utf8')) as Map<string, string>
  const protocol = jsonToMap(fs.readFileSync('./addresses/protocol.json', 'utf8')) as Map<string, string>
  const chiSources = jsonToMap(fs.readFileSync('./addresses/chiSources.json', 'utf8')) as Map<string, string>

  // Contract instantiation
  const compoundOracle = (await ethers.getContractAt(
    'CompoundMultiOracle',
    protocol.get('compoundOracle') as string,
    ownerAcc
  )) as unknown as CompoundMultiOracle
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  console.log(`compoundOracle: ${compoundOracle.address}`)

  // Build proposal
  const proposal: Array<{ target: string; data: string }> = []
  for (let [baseId, sourceAddress] of newSources) {
    const cToken = (await ethers.getContractAt('ERC20Mock', sourceAddress as string, ownerAcc)) as unknown as ERC20Mock
    console.log(`Using ${await cToken.name()} at ${sourceAddress}`)
    proposal.push({
      target: compoundOracle.address,
      data: compoundOracle.interface.encodeFunctionData('setSource', [baseId, CHI, sourceAddress]),
    })
    console.log(`[Chi(${bytesToString(baseId)}): ${chiSources.get(baseId) || undefined} -> ${sourceAddress}],`)
    chiSources.set(baseId, sourceAddress)
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
  fs.writeFileSync('./addresses/chiSources.json', mapToJson(chiSources), 'utf8')
})()

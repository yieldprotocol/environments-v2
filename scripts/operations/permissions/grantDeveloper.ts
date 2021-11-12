/**
 * @dev This script grants a development role, by allowing an account to `propose` and `execute` on the Timelock,
 * as well as `execute` on the cloak.
 *
 * It takes as inputs the governance file.
 */

import { ethers } from 'hardhat'
import * as hre from 'hardhat'
import * as fs from 'fs'
import { id } from '@yield-protocol/utils-v2'
import { jsonToMap } from '../../../shared/helpers'

import { Timelock } from '../../../typechain/Timelock'
import { EmergencyBrake } from '../../../typechain/EmergencyBrake'

;(async () => {
  const newDeveloper = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
  
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: ["0xA072f81Fea73Ca932aB2B5Eda31Fa29306D58708"],
  });
  const ownerAcc = await ethers.getSigner("0xA072f81Fea73Ca932aB2B5Eda31Fa29306D58708")
  // const [ownerAcc] = await ethers.getSigners()
  const governance = jsonToMap(fs.readFileSync('./addresses/governance.json', 'utf8')) as Map<string, string>

  // Contract instantiation
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
  proposal.push({
    target: timelock.address,
    data: timelock.interface.encodeFunctionData('grantRoles', [
      [
        '0xca02753a', // propose,
        '0x013a652d', // proposeRepeated
        '0xbaae8abf', // execute
        '0xf9a28e8b', // executeRepeated
      ],
      newDeveloper,
    ]),
  })
  proposal.push({
    target: cloak.address,
    data: cloak.interface.encodeFunctionData('grantRoles', [[id(cloak.interface, 'execute(bytes32)')], newDeveloper]),
  })
  console.log(`New developer ${newDeveloper}`)

  // Propose, approve, execute
  const txHash = await timelock.hash(proposal)
  console.log(`Proposal: ${txHash}`)
  // Comment out sections below to propose, approve (impersonating multisig) or execute
  if ((await timelock.proposals(txHash)).state === 0) {
    await timelock.propose(proposal)
    while ((await timelock.proposals(txHash)).state < 1) {}
    console.log(`Proposed ${txHash}`)
  }
  if ((await timelock.proposals(txHash)).state === 1) {
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: ["0xd659565b84BcfcB23B02ee13E46CB51429F4558A"],
    });
    const multisigAcc = await ethers.getSigner("0xd659565b84BcfcB23B02ee13E46CB51429F4558A")
    await timelock.connect(multisigAcc).approve(txHash)
    while ((await timelock.proposals(txHash)).state < 2) {}
    console.log(`Approved ${txHash}`)
  }
  if ((await timelock.proposals(txHash)).state === 2) {
    await timelock.execute(proposal)
    while ((await timelock.proposals(txHash)).state > 0) {}
    console.log(`Executed ${txHash}`)
  }
})()
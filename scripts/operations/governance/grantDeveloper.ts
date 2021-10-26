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
  
  const governance = jsonToMap(fs.readFileSync('./addresses/governance.json', 'utf8')) as Map<string, string>

  let [ownerAcc] = await ethers.getSigners()
  // If we are running in a mainnet fork, the account used is the default hardhat one, we can detect that and impersonate the deployer
  if (ownerAcc.address === "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266") {
    const deployer = governance.get('deployer') as string
    console.log(`Running on a fork, impersonating ${deployer}`)
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [deployer],
    });
    ownerAcc = await ethers.getSigner(deployer)
  }

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

  // Depending on the proposal state, propose, approve (if in a fork, impersonating the multisig), or execute
  if ((await timelock.proposals(txHash)).state === 0) { // Propose
    await timelock.propose(proposal)
    while ((await timelock.proposals(txHash)).state < 1) {}
    console.log(`Proposed ${txHash}`)
  } else if ((await timelock.proposals(txHash)).state === 1) { // Approve, impersonating multisig if in a fork
    // If running on a mainnet fork, impersonating the multisig will work
    const multisig = governance.get('multisig') as string
    console.log(`Running on a fork, impersonating multisig at ${multisig}`)
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [multisig],
    });
    const multisigAcc = await ethers.getSigner(multisig)
    await timelock.connect(multisigAcc).approve(txHash)
    while ((await timelock.proposals(txHash)).state < 2) {}
    console.log(`Approved ${txHash}`)
  } else if ((await timelock.proposals(txHash)).state === 2) { // Execute
    await timelock.execute(proposal)
    while ((await timelock.proposals(txHash)).state > 0) {}
    console.log(`Executed ${txHash}`)
  }
})()

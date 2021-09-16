/**
 * @dev This script grants a governor role to an account, by allowing it to control the timelock and cloak,
 * as well as allowing to register emergency plans.
 * It takes as inputs the governance file.
 */

import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { id } from '@yield-protocol/utils-v2'
import { jsonToMap } from '../../shared/helpers'

import { Timelock } from '../../typechain/Timelock'
import { EmergencyBrake } from '../../typechain/EmergencyBrake'

(async () => {
  const newGovernor = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
  const [ ownerAcc ] = await ethers.getSigners();
  const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string, string>;

  // Contract instantiation
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc) as unknown as Timelock
  const cloak = await ethers.getContractAt('EmergencyBrake', governance.get('cloak') as string, ownerAcc) as unknown as EmergencyBrake

  // Build the proposal
  const proposal : Array<{ target: string; data: string}> = []
  proposal.push({
    target: timelock.address,
    data: timelock.interface.encodeFunctionData('grantRoles', [
        [
          '0xca02753a', // propose,
          '0x013a652d', // proposeRepeated
          '0xa53a1adf', // approve
          '0xbaae8abf', // execute
          '0xf9a28e8b', // executeRepeated
        ],
        newGovernor
    ])
  })

  // Access to the cloak is direct, instead of through the timelock (which would have a delay)
  proposal.push({
    target: cloak.address,
    data: cloak.interface.encodeFunctionData('grantRoles', [
        [
            '0xde8a0667', // id(cloak.interface, 'plan(address,tuple[])'),
            id(cloak.interface, 'cancel(bytes32)'),
            id(cloak.interface, 'execute(bytes32)'),
            id(cloak.interface, 'restore(bytes32)'),
            id(cloak.interface, 'terminate(bytes32)'),
        ],
        timelock.address
    ])
  })
  console.log(`New governor ${newGovernor}`)

  // Propose, approve, execute
  const txHash = await timelock.callStatic.propose(proposal)
  await timelock.propose(proposal); console.log(`Proposed ${txHash}`)
  await timelock.approve(txHash); console.log(`Approved ${txHash}`)
  await timelock.execute(proposal); console.log(`Executed ${txHash}`)
})()
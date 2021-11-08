import { ethers } from 'hardhat'
import * as fs from 'fs'
import { jsonToMap, getOwnerOrImpersonate } from '../../../../shared/helpers'

import { Timelock, EmergencyBrake } from '../../../../typechain'

/**
 * @dev This script tests that an user doesn't have governor permissions
 */

;(async () => {
  const testedAddress = ''
  const ownerAcc = await getOwnerOrImpersonate(testedAddress)

  const governance = jsonToMap(fs.readFileSync('./addresses/governance.json', 'utf8')) as Map<string, string>

  const multisig = governance.get('multisig') as string

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

  // Try and fail to propose
  // Try and fail to proposeRepeated
  // Use the multisig to propose giving ROOT in the Timelock to the multisig
  // Use the multisig to proposeRepeated giving ROOT in the Timelock to the multisig
  // Try and fail to approve
  // Use the multisig to approve both proposals
  // Try and fail to execute
  // Try and fail to executeRepeated

  // Try and fail to plan revoking ROOT access to the cloak from the timelock
  // Use the multisig to plan revoking ROOT access to the cloak from the timelock
  // Try and fail to cancel the plan
  // Try and fail to execute the plan
  // Use the multisig to execute the plan
  // Try and fail to terminate the plan
  // Try and fail to restore the plan
})()

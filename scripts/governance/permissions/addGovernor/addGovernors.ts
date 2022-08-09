import { ethers } from 'hardhat'
import { readAddressMappingIfExists, getOwnerOrImpersonate, proposeApproveExecute } from '../../../../shared/helpers'

import { grantGovernorsProposal } from '../../../fragments/permissions/grantGovernorsProposal'
import { Timelock, EmergencyBrake } from '../../../../typechain'
const { newGovernors, developerToImpersonate } = require(process.env.CONF as string)

/**
 * @dev This script gives governor privileges to one or more accounts.
 */
;(async () => {
  const governance = readAddressMappingIfExists('governance.json')

  const timelock = (await ethers.getContractAt('Timelock', governance.get('timelock') as string)) as unknown as Timelock

  const cloak = (await ethers.getContractAt(
    'EmergencyBrake',
    governance.get('cloak') as string
  )) as unknown as EmergencyBrake

  let proposal = await grantGovernorsProposal(timelock, cloak, newGovernors)

  await proposeApproveExecute(
    timelock,
    proposal,
    governance.get('multisig') as string,
    developerToImpersonate as string
  )
})()

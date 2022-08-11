import { ethers } from 'hardhat'
import { readAddressMappingIfExists, getOwnerOrImpersonate, proposeApproveExecute } from '../../../../shared/helpers'

import { grantDevelopersProposal } from '../../../fragments/permissions/grantDevelopersProposal'
import { Timelock, EmergencyBrake } from '../../../../typechain'

const { newDevelopers, developerToImpersonate } = require(process.env.CONF as string)

/**
 * @dev This script gives developer privileges to one or more accounts.
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developerToImpersonate as string)

  const governance = readAddressMappingIfExists('governance.json')

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

  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await grantDevelopersProposal(timelock, cloak, newDevelopers))

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()

import { ethers } from 'hardhat'
import { proposeApproveExecute } from '../../../../shared/helpers'

import { grantDevelopersProposal } from '../../../fragments/permissions/grantDevelopersProposal'

const { governance, newDevelopers, developer } = require(process.env.CONF as string)

/**
 * @dev This script gives developer privileges to one or more accounts.
 */
;(async () => {
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string)
  const cloak = await ethers.getContractAt('EmergencyBrake', governance.get('cloak') as string)

  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await grantDevelopersProposal(timelock, cloak, newDevelopers))

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string, developer)
})()

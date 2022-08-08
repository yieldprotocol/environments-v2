import { ethers } from 'hardhat'

import { getOwnerOrImpersonate, proposeApproveExecute } from '../../../../shared/helpers'
import { restorePlanProposal } from '../../../fragments/emergency/restorePlanProposal'
import { EmergencyBrake, Timelock } from '../../../../typechain'

const { governance, developer, plan } = require(process.env.CONF as string)

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  // Contract instantiation
  const cloak = (await ethers.getContractAt(
    'EmergencyBrake',
    governance.get('cloak') as string,
    ownerAcc
  )) as unknown as EmergencyBrake

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await restorePlanProposal(cloak, plan))

  // Propose, Approve & execute
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()

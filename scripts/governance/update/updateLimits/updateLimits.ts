/**
 * @dev This script updates the debt limits in the Cauldron.
 */

import { ethers } from 'hardhat'

import { getOwnerOrImpersonate, proposeApproveExecute } from '../../../../shared/helpers'
import { updateLimitsProposal } from '../../../fragments/limits/updateLimitsProposal'
import { Cauldron, Timelock } from '../../../../typechain'

const { governance, protocol, developer, newLimits } = require(process.env.CONF as string)

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  // Contract instantiation
  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await updateLimitsProposal(cauldron, newLimits))

  // Propose, Approve & execute
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()

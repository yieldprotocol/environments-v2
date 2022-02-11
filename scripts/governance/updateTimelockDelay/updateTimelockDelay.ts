/**
 * @dev This script updates the delay in the Timelock.
 */

import { ethers } from 'hardhat'

import { getOwnerOrImpersonate, proposeApproveExecute, readAddressMappingIfExists } from '../../../shared/helpers'
import { updateTimelockDelayProposal } from '../../fragments/timelock/updateTimelockDelayProposal'
import { Timelock } from '../../../typechain'
import { newDelayTime, developer } from './updateTimelockDelay.mainnet.config'
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)
  const governance = readAddressMappingIfExists('governance.json')

  // Contract instantiation
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await updateTimelockDelayProposal(timelock, newDelayTime))

  // Propose, Approve & execute
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()

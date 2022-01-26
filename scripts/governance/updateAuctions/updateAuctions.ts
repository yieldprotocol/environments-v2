/**
 * @dev This script updates the auction limits in the Witch.
 */

import { ethers } from 'hardhat'

import {
  getOwnerOrImpersonate,
  proposeApproveExecute,
  readAddressMappingIfExists
} from '../../../shared/helpers'
import { updateWitchLimitsProposal } from '../../fragments/liquidations/updateWitchLimitsProposal'
import { updateInitialOfferProposal } from '../../fragments/liquidations/updateInitialOfferProposal'
import { Witch, Timelock } from '../../../typechain'
import { newLimits, newInitialOffer, developer } from './updateAuctions.mainnet.config'

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)
  const governance = readAddressMappingIfExists('governance.json');
  const protocol = readAddressMappingIfExists('protocol.json');

  // Contract instantiation
  const witch = ((await ethers.getContractAt(
    'Witch',
    protocol.get('witch') as string,
    ownerAcc
  )) as unknown) as Witch

  const timelock = ((await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown) as Timelock

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await updateWitchLimitsProposal(witch, newLimits))
  proposal = proposal.concat(await updateInitialOfferProposal(witch, newInitialOffer))
  // Propose, Approve & execute
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()

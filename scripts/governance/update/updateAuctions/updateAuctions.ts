/**
 * @dev This script updates the auction limits in the Witch.
 */

import { ethers } from 'hardhat'

import { getOwnerOrImpersonate, proposeApproveExecute, readAddressMappingIfExists } from '../../../../shared/helpers'
import { updateWitchLimitsInitialOfferProposal } from '../../../fragments/liquidations/updateWitchLimitsInitialOfferProposal'
import { Witch, Timelock } from '../../../../typechain'
import { newLimits, developer } from './updateAuctions.mainnet.config'
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)
  const governance = readAddressMappingIfExists('governance.json')
  const protocol = readAddressMappingIfExists('protocol.json')

  // Contract instantiation
  const witch = (await ethers.getContractAt('Witch', protocol.get('witch') as string, ownerAcc)) as unknown as Witch

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await updateWitchLimitsInitialOfferProposal(witch, newLimits))

  // Propose, Approve & execute
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()

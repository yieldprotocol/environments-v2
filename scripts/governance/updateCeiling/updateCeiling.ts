/**
 * @dev This script updates the dust limits for one or more base/ilk pairs.
 *
 * It takes as inputs the governance and protocol address files.
 */

import { ethers } from 'hardhat'
import {
  getOwnerOrImpersonate,
  getOriginalChainId,
  proposeApproveExecute,
  getGovernanceProtocolAddresses,
} from '../../../shared/helpers'
import { updateCeilingProposal } from '../../fragments/limits/updateCeilingProposal'
import { newLimits, developer } from './updateCeiling.config'
;(async () => {
  const chainId = await getOriginalChainId()
  const [governance, protocol] = await getGovernanceProtocolAddresses(chainId)
  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string)

  // Contract instantiation
  const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc)

  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc)

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await updateCeilingProposal(cauldron, newLimits))

  // Propose, Approve & execute
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()

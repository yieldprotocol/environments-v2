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
  getGovernanceProtocolAddresses
} from '../../../shared/helpers'
import { updateCeilingProposal } from '../../limits/updateCeilingProposal'
import { Cauldron, Timelock } from '../../../typechain'
import { newMax, developerIfImpersonating } from './updateCeiling.config'

;(async () => {
  const chainId = await getOriginalChainId()
  const [governance, protocol] = await getGovernanceProtocolAddresses(chainId)
  let ownerAcc = await getOwnerOrImpersonate(developerIfImpersonating.get(chainId) as string)

  // Contract instantiation
  const cauldron = ((await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown) as Cauldron

  const timelock = ((await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown) as Timelock

  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = await updateCeilingProposal(cauldron, newMax)
  // Propose, Approve & execute
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()

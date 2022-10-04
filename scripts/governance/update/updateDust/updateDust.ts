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
  readAddressMappingIfExists,
} from '../../../../shared/helpers'
import { updateDustProposal } from '../../../fragments/limits/updateDustProposal'
import { OldWitch, Cauldron, Timelock } from '../../../../typechain'
import { updateWitchLimitsInitialOfferProposal } from '../../../fragments/liquidations/updateWitchLimitsInitialOfferProposal'

const { governance, protocol, developer, newDebtMin, newAuctionMin } = require(process.env.CONF as string)
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer.get(1))
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

  // Contract instantiation
  const witch = (await ethers.getContractAt(
    'OldWitch',
    protocol.get('witch') as string,
    ownerAcc
  )) as unknown as OldWitch

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = await updateDustProposal(cauldron, newDebtMin)

  //Update auction limits
  proposal = proposal.concat(await updateWitchLimitsInitialOfferProposal(witch, newAuctionMin))

  // Propose, Approve & execute
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string, developer.get(1))
})()

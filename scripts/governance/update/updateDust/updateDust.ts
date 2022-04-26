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
} from '../../../shared/helpers'
import { updateDustProposal } from '../../fragments/limits/updateDustProposal'
import { Cauldron, Timelock } from '../../../typechain'
const { governance, protocol, developer, newMin } = require(process.env.CONF as string)
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
  const proposal: Array<{ target: string; data: string }> = await updateDustProposal(cauldron, newMin)
  // Propose, Approve & execute
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()

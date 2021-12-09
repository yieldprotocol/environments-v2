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
  readAddressMappingIfExists
} from '../../../shared/helpers'
import { updateInitialOfferProposal } from '../../fragments/liquidations/updateInitialOfferProposal'
import { Witch, Timelock } from '../../../typechain'
import { newInitialOffer, developer } from './updateInitialOffer.mainnet.config'

;(async () => {
  const chainId = await getOriginalChainId()
  if (!(chainId === 1 || chainId === 4 || chainId === 42)) throw 'Only Rinkeby, Kovan and Mainnet supported'

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
  const proposal: Array<{ target: string; data: string }> = await updateInitialOfferProposal(witch, newInitialOffer)
  // Propose, Approve & execute
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()

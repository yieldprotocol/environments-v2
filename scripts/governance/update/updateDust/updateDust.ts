/**
 * @dev This script updates the dust limits for one or more base/ilk pairs.
 *
 * It takes as inputs the governance and protocol address files.
 */
import { ethers } from 'hardhat'
import { updateDustProposal } from '../../../fragments/limits/updateDust'

import { getOwnerOrImpersonate, propose } from '../../../../shared/helpers'
import {
  IOracle,
  CompositeMultiOracle__factory,
  UniswapV3Oracle__factory,
  Cauldron__factory,
  Ladle__factory,
  Timelock__factory,
  Witch__factory,
} from '../../../../typechain'

import { CAULDRON, TIMELOCK } from '../../../../shared/constants'

const { developer, deployer } = require(process.env.CONF as string)
const { governance, protocol } = require(process.env.CONF as string)
const { newDebtMin, newAuctionMin } = require(process.env.CONF as string)

;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)
  const cauldron = Cauldron__factory.connect(protocol().getOrThrow(CAULDRON)!, ownerAcc)
  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK)!, ownerAcc)

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = await updateDustProposal(cauldron, newDebtMin)

  // //Update auction limits
  // proposal = proposal.concat(await updateWitchLimitsInitialOfferProposal(witch, newAuctionMin))

  if (proposal.length > 0) {
    // Propose, Approve & execute
    await propose(timelock, proposal, developer)
  }
})()

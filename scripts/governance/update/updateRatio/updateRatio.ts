import { ethers } from 'hardhat'
import { proposeApproveExecute, getOwnerOrImpersonate } from '../../../../shared/helpers'

import { updateRatioProposal } from '../../../fragments/oracles/updateRatioProposal'
import { updateWitchLimitsInitialOfferProposal } from '../../../fragments/liquidations/updateWitchLimitsInitialOfferProposal'

import { Timelock, Cauldron, Witch } from '../../../../typechain'
const { developer } = require(process.env.CONF as string)
const { protocol, governance } = require(process.env.CONF as string)
const { ratios, newLimits } = require(process.env.CONF as string)

/**
 * @dev This script sets up a new spotOracle and updates the existingbase/ilk pairs in the Cauldron
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  // Contract instantiation
  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron

  const witch = (await ethers.getContractAt('Witch', protocol.get('witch') as string, ownerAcc)) as unknown as Witch

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await updateWitchLimitsInitialOfferProposal(witch, newLimits))
  proposal = proposal.concat(await updateRatioProposal(ownerAcc, cauldron, ratios))

  // Propose, Approve & execute
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()

import { ethers } from 'hardhat'
import { proposeApproveExecute, getOwnerOrImpersonate } from '../../../../shared/helpers'

import { updateRatioProposal } from '../../../fragments/oracles/updateRatioProposal'

import { Timelock, Cauldron } from '../../../../typechain'
const { developer } = require(process.env.CONF as string)
const { protocol, governance } = require(process.env.CONF as string)
const { ratios } = require(process.env.CONF as string)

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

  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await updateRatioProposal(ownerAcc, cauldron, ratios))

  // Propose, Approve & execute
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()

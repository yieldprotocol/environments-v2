import { ethers } from 'hardhat'
import { getOwnerOrImpersonate, proposeApproveExecute } from '../../../../shared/helpers'

import { Cauldron, Timelock } from '../../../../typechain'

import { addIlksToSeriesProposal } from '../../../fragments/assetsAndSeries/addIlksToSeries'

const { developer, governance, protocol, seriesIlks } = require(process.env.CONF as string)

/**
 * @dev This script sets up the oracles
 */
;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)

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
  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await addIlksToSeriesProposal(cauldron, seriesIlks))

  if (proposal.length > 0) {
    // Propose, Approve & execute
    await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
  }
})()

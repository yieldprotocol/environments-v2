import { ethers } from 'hardhat'
import { getOwnerOrImpersonate, proposeApproveExecute } from '../../../../shared/helpers'

import { Ladle, Timelock } from '../../../../typechain'

import { orchestrateModuleProposal } from '../../../fragments/modules/orchestrateModuleProposal'

const { developer, governance, protocol } = require(process.env.CONF as string)

/**
 * @dev This script sets up the oracles
 */
;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)

  const ladle = (await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as unknown as Ladle
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []

  // Module
  proposal = proposal.concat(await orchestrateModuleProposal(ladle, protocol.get('wrapEtherModule') as string))

  // Propose, Approve & execute
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()

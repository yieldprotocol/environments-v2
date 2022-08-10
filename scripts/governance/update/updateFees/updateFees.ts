/**
 * @dev This script updates the fees in the pools.
 */

import { ethers } from 'hardhat'

import { proposeApproveExecute } from '../../../../shared/helpers'
import { setFeesProposal } from '../../../fragments/pools/setFeesProposal'
import { Timelock } from '../../../../typechain'

const { governance, developer, pools, poolFees } = require(process.env.CONF as string)

;(async () => {
  const timelock = (await ethers.getContractAt('Timelock', governance.get('timelock') as string)) as unknown as Timelock

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await setFeesProposal(pools, poolFees))

  // Propose, Approve & execute
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string, developer)
})()

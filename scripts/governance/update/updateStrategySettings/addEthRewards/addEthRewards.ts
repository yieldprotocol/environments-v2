import { ethers } from 'hardhat'
import { getOwnerOrImpersonate, propose } from '../../../../../shared/helpers'
import { addEthRewardsProposal } from '../../../../../scripts/fragments/strategies/addEthRewardsProposal'
import { Timelock } from '../../../../../typechain'

const { developer } = require(process.env.CONF as string)
const { governance } = require(process.env.CONF as string)
const { strategies, strategiesData } = require(process.env.CONF as string)

/**
 * @dev This script creates a proposal to call `setRewards()` and `setRewardsTokens()` on all ETH strategies
 */
;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = await addEthRewardsProposal(
    ownerAcc,
    timelock,
    strategies,
    strategiesData
  )

  if (proposal.length > 0) {
    // Propose, Approve & execute
    await propose(timelock, proposal, governance.get('multisig') as string)
  }
})()

import { getOwnerOrImpersonate, propose } from '../../../../../shared/helpers'
import { addEthRewardsProposal } from '../../../../fragments/strategies/addEthRewardsProposal'
import { Timelock__factory } from '../../../../../typechain'
import { TIMELOCK } from '../../../../../shared/constants'

const { developer, governance } = require(process.env.CONF as string)
const { strategies, rewardsData } = require(process.env.CONF as string)

/**
 * @dev This script creates a proposal to call `setRewards()` and `setRewardsTokens()` on all ETH strategies
 */
;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)
  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK)!, ownerAcc)

  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = await addEthRewardsProposal(
    ownerAcc,
    strategies,
    rewardsData
  )

  if (proposal.length > 0) {
    // Propose, Approve & execute
    await propose(timelock, proposal, developer)
  }
})()

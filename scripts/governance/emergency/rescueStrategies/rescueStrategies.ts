import { getOwnerOrImpersonate } from '../../../../shared/helpers'
import { Timelock__factory, StrategyRescue__factory } from '../../../../typechain'
import { STRATEGY_RESCUE, TIMELOCK, WAD } from '../../../../shared/constants'
import { rescueStrategiesProposal } from './rescueStrategyProposal'
import { orchestrateRescueStrategy } from './orchestrateRescueStrategy'
import { propose } from '../../../../shared/helpers'
const { developer, strategiesToRecover, protocol, governance } = require(process.env.CONF as string)

/**
 * @dev This script rescues strategies
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer, WAD)
  let strategyRescue = StrategyRescue__factory.connect(protocol().getOrThrow(STRATEGY_RESCUE)!, ownerAcc)
  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK)!, ownerAcc)
  // Execute the strategyRescue contract
  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await orchestrateRescueStrategy(strategyRescue, timelock))
  proposal = proposal.concat(await rescueStrategiesProposal(strategyRescue, strategiesToRecover, timelock, ownerAcc))

  await propose(timelock, proposal, developer)
})()

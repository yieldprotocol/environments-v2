import { getOwnerOrImpersonate } from '../../../../shared/helpers'
import { Timelock__factory, StrategyRescue__factory, Strategy__factory } from '../../../../typechain'
import { STRATEGY_RESCUE, TIMELOCK, WAD } from '../../../../shared/constants'
import { rescueStrategiesProposal } from './rescueStrategyProposal'
import { orchestrateRescueStrategy } from './orchestrateRescueStrategy'
import { propose } from '../../../../shared/helpers'
import { sendTokens } from '../../../fragments/utils/sendTokens'
import { Asset, Transfer } from '../../confTypes'
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
  for (let index = 0; index < strategiesToRecover.length; index++) {
    const element = strategiesToRecover[index]
    const asset: Asset = {
      assetId: '',
      address: element['strategy'],
    }
    const strategy = Strategy__factory.connect(element['strategy'], ownerAcc)
    const transfer: Transfer = {
      token: asset,
      receiver: element['strategy'],
      amount: await strategy.balanceOf(timelock.address),
    }
    proposal = proposal.concat(await sendTokens(timelock, transfer))
  }
  proposal = proposal.concat(await rescueStrategiesProposal(strategyRescue, strategiesToRecover, timelock, ownerAcc))

  await propose(timelock, proposal, developer)
})()

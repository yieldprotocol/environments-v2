import { getOwnerOrImpersonate } from '../../../../shared/helpers'
import { Timelock__factory, Strategy__factory, StrategyRescue__factory } from '../../../../typechain'
import { STRATEGY_RESCUE, TIMELOCK, WAD } from '../../../../shared/constants'
const { developer, strategiesToRecover, protocol, governance } = require(process.env.CONF as string)

/**
 * @dev This script tests borrowing
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer, WAD)
  let strategyRescue = StrategyRescue__factory.connect(protocol().getOrThrow(STRATEGY_RESCUE)!, ownerAcc)
  let timelockAcc = await getOwnerOrImpersonate(governance.getOrThrow(TIMELOCK)!, WAD)
  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK)!, ownerAcc)
  // Execute the strategyRescue contract
  await strategyRescue.connect(timelockAcc).grantRole('0x5281e688', timelock.address)

  for (let index = 0; index < strategiesToRecover.length; index++) {
    const element = strategiesToRecover[index]
    const strategy = Strategy__factory.connect(element['strategy'], ownerAcc)
    // Transfer funds from timelock to strategy
    await strategy.connect(timelockAcc).transfer(strategy.address, await strategy.balanceOf(timelock.address))
    await strategyRescue.connect(timelockAcc).startRescue(element['underlyingId'], strategy.address)
  }
})()

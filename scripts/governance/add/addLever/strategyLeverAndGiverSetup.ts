import {
  Timelock__factory,
  Cauldron__factory,
  Giver__factory,
  YieldStrategyLever__factory,
} from '../../../../typechain'
import { getOwnerOrImpersonate, propose } from '../../../../shared/helpers'
import { orchestrateLever } from '../../../fragments/utils/orchestrateLever'
import { setFlashFeeOnFytoken } from '../../../fragments/flash/setFlashFeeOnFyToken'
import { TIMELOCK, CAULDRON, GIVER, YIELD_STRATEGY_LEVER } from '../../../../shared/constants'
import { setFlashFeeOnJoin } from '../../../fragments/flash/setFlashFeeOnJoin'

const { developer } = require(process.env.CONF as string)
const { protocol, governance, joinFlashFees, fyTokenFlashFees } = require(process.env.CONF as string)

/**
 * @dev This script orchestrates the YieldStrategyLever, Giver and sets flashfeefactor on joins and fyTokens
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)
  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK), ownerAcc)
  const giver = Giver__factory.connect(protocol().getOrThrow(GIVER), ownerAcc)
  const yieldStrategyLever = YieldStrategyLever__factory.connect(protocol().getOrThrow(YIELD_STRATEGY_LEVER), ownerAcc)
  const cauldron = Cauldron__factory.connect(protocol().getOrThrow(CAULDRON), ownerAcc)

  let proposal: Array<{ target: string; data: string }> = await orchestrateLever(yieldStrategyLever, giver)
  proposal = proposal.concat(await setFlashFeeOnJoin(joinFlashFees))
  proposal = proposal.concat(await setFlashFeeOnFytoken(fyTokenFlashFees))
  await propose(timelock, proposal, developer)
})()

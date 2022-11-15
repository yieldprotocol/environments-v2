import {
  Timelock__factory,
  Cauldron__factory,
  Giver__factory,
  YieldStrategyLever__factory,
  YieldNotionalLever__factory,
} from '../../../../typechain'
import { getOwnerOrImpersonate, propose } from '../../../../shared/helpers'
import { orchestrateLeverProposal } from '../../../fragments/utils/orchestrateLeverProposal'
import { setFlashFeeOnJoinProposal } from '../../../fragments/setFlashFeeOnJoinProposal'
import { setFlashFeeOnFytokenProposal } from '../../../fragments/setFlashFeeOnFyTokenProposal'
import { TIMELOCK, CAULDRON, GIVER, YIELD_NOTIONAL_LEVER } from '../../../../shared/constants'
import { orchestrateNotionalIlks } from '../../../fragments/utils/orchestrateNotionalIlks'

const { developer, deployer } = require(process.env.CONF as string)
const { protocol, governance, joinFlashFees, fyTokenFlashFees, ilkInfo } = require(process.env.CONF as string)

/**
 * @dev This script orchestrates the yieldNotionalLever and sets flashfeefactor on joins and fyTokens
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)
  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK), ownerAcc)
  const giver = Giver__factory.connect(protocol().getOrThrow(GIVER), ownerAcc)
  const yieldNotionalLever = YieldNotionalLever__factory.connect(protocol().getOrThrow(YIELD_NOTIONAL_LEVER), ownerAcc)
  const cauldron = Cauldron__factory.connect(protocol().getOrThrow(CAULDRON), ownerAcc)

  let proposal: Array<{ target: string; data: string }> = await orchestrateLeverProposal(yieldNotionalLever, giver)
  proposal = proposal.concat(await setFlashFeeOnJoinProposal(joinFlashFees))
  proposal = proposal.concat(await setFlashFeeOnFytokenProposal(fyTokenFlashFees))
  proposal = proposal.concat(await orchestrateNotionalIlks(yieldNotionalLever, ilkInfo))
  await propose(timelock, proposal, developer)
})()

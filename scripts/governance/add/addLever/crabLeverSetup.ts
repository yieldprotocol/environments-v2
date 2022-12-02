import { Timelock__factory, Giver__factory } from '../../../../typechain'
import { getOwnerOrImpersonate, propose } from '../../../../shared/helpers'
import { orchestrateLeverProposal } from '../../../fragments/utils/orchestrateLeverProposal'
import { TIMELOCK, GIVER, YIELD_CRAB_LEVER } from '../../../../shared/constants'
import { YieldCrabLever__factory } from '../../../../typechain/factories/contracts/YieldCrabLever.sol'

const { developer } = require(process.env.CONF as string)
const { protocol, governance } = require(process.env.CONF as string)

/**
 * @dev This script orchestrates the yieldCrabLever and sets flashfeefactor on joins and fyTokens
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)
  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK), ownerAcc)
  const giver = Giver__factory.connect(protocol().getOrThrow(GIVER), ownerAcc)
  const yieldCrabLever = YieldCrabLever__factory.connect(protocol().getOrThrow(YIELD_CRAB_LEVER), ownerAcc)

  let proposal: Array<{ target: string; data: string }> = await orchestrateLeverProposal(yieldCrabLever, giver)

  await propose(timelock, proposal, developer)
})()

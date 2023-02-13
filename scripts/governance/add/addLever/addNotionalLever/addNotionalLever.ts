import { Timelock__factory, Giver__factory, YieldNotionalLever__factory } from '../../../../../typechain'
import { getOwnerOrImpersonate, propose } from '../../../../../shared/helpers'
import { orchestrateLever } from '../../../../fragments/utils/orchestrateLever'
import { TIMELOCK, GIVER, YIELD_NOTIONAL_LEVER } from '../../../../../shared/constants'

const { developer } = require(process.env.CONF as string)
const { protocol, governance } = require(process.env.CONF as string)

/**
 * @dev This script orchestrates the YieldNotionalLever, Giver and sets flashfeefactor on joins and fyTokens
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)
  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK), ownerAcc)
  const giver = Giver__factory.connect(protocol().getOrThrow(GIVER), ownerAcc)

  let proposal: Array<{ target: string; data: string }> = await orchestrateLever(
    protocol().getOrThrow(YIELD_NOTIONAL_LEVER),
    giver
  )

  await propose(timelock, proposal, developer)
})()

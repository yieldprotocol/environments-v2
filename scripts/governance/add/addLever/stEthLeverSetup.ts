import {
  Timelock__factory,
  Giver__factory,
  YieldStEthLever__factory,
  Ladle__factory,
  FYToken__factory,
  FlashJoin__factory,
} from '../../../../typechain'
import { getOwnerOrImpersonate, propose } from '../../../../shared/helpers'
import { orchestrateLever } from '../../../fragments/utils/orchestrateLever'
import { setFlashFeeOnFytoken } from '../../../fragments/flash/setFlashFeeOnFyToken'
import { TIMELOCK, GIVER, YIELD_STETH_LEVER, LADLE } from '../../../../shared/constants'
import { setFlashFeeOnJoin } from '../../../fragments/flash/setFlashFeeOnJoin'

const { developer } = require(process.env.CONF as string)
const { protocol, governance, joinFlashFees, fyTokenFlashFees, fyTokens, joins } = require(process.env.CONF as string)

/**
 * @dev This script orchestrates the YieldStEthLever, Giver and sets flashfeefactor on joins and fyTokens
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)
  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK), ownerAcc)
  const giver = Giver__factory.connect(protocol().getOrThrow(GIVER), ownerAcc)
  const yieldStEthLever = YieldStEthLever__factory.connect(protocol().getOrThrow(YIELD_STETH_LEVER), ownerAcc)
  const ladle = Ladle__factory.connect(protocol().getOrThrow(LADLE), ownerAcc)

  let proposal: Array<{ target: string; data: string }> = await orchestrateLever(yieldStEthLever.address, giver)
  for (let [assetId, fee] of joinFlashFees) {
    const join = FlashJoin__factory.connect(joins.getOrThrow(assetId)!, ownerAcc)
    proposal = proposal.concat(await setFlashFeeOnJoin(ladle, join, fee))
  }

  for (let [seriesId, fee] of fyTokenFlashFees) {
    const fyToken = FYToken__factory.connect(fyTokens.getOrThrow(seriesId)!, ownerAcc)
    proposal = proposal.concat(await setFlashFeeOnFytoken(fyToken, fee))
  }

  await propose(timelock, proposal, developer)
})()

import { Timelock__factory, Ladle__factory, FYToken__factory, FlashJoin__factory } from '../../../../typechain'
import { getOwnerOrImpersonate, propose } from '../../../../shared/helpers'
import { setFlashFeeOnFytoken } from '../../../fragments/flash/setFlashFeeOnFyToken'
import { TIMELOCK, LADLE } from '../../../../shared/constants'
import { setFlashFeeOnJoin } from '../../../fragments/flash/setFlashFeeOnJoin'

const { developer } = require(process.env.CONF as string)
const { protocol, governance, joinFlashFees, fyTokenFlashFees, fyTokens, joins } = require(process.env.CONF as string)

/**
 * @dev This script sets flashfeefactor on joins and fyTokens
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)
  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK), ownerAcc)
  const ladle = Ladle__factory.connect(protocol().getOrThrow(LADLE), ownerAcc)

  let proposal: Array<{ target: string; data: string }> = []
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

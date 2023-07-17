import { getOwnerOrImpersonate, propose } from '../../../../shared/helpers'
import { Timelock__factory } from '../../../../typechain'
import { TIMELOCK } from '../../../../shared/constants'
import { sendTokens } from '../../../fragments/utils/sendTokens'

const { developer, governance, traderFunding } = require(process.env.CONF as string)

/**
 * @dev This script funds the Trader with assets from the Timelock
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK)!, ownerAcc)

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []

  for (let transfer of traderFunding) {
    proposal = proposal.concat(await sendTokens(timelock, transfer))
  }

  await propose(timelock, proposal, developer)
})()

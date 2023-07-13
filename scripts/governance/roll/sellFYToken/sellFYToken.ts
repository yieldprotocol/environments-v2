import { getOwnerOrImpersonate, propose } from '../../../../shared/helpers'

import {
  Timelock__factory,
  Trader__factory,
} from '../../../../typechain'

import { TIMELOCK, TRADER_DXDY } from '../../../../shared/constants'

import { sellFYTokens } from '../../../fragments/utils/sellFYTokens'

const { developer, governance, protocol, fyTokenSelling } = require(process.env.CONF as string)

/**
 * @dev This script uses the Trader to move underlying from pools to joins
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK)!, ownerAcc)
  const trader = Trader__factory.connect(protocol.getOrThrow(TRADER_DXDY)!, ownerAcc)

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []

  for (let sale of fyTokenSelling) {
    proposal = proposal.concat(await sellFYTokens(trader, sale))
  }

  await propose(timelock, proposal, developer)
})()

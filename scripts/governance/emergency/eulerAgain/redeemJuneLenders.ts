import { getOwnerOrImpersonate, propose } from '../../../../shared/helpers'

import {
  Timelock__factory,
  Join__factory,
} from '../../../../typechain'

import { TIMELOCK } from '../../../../shared/constants'

import { exitJoin } from '../../../fragments/emergency/exitJoin'

const { developer, governance, joins, transfers } = require(process.env
  .CONF as string)

/**
 * @dev This script sends assets to users from joins
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK)!, ownerAcc)

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []

  for (let transfer of transfers) {
    const join = Join__factory.connect(joins.getOrThrow(transfer.token.assetId)!, ownerAcc)

    proposal = proposal.concat(
      await exitJoin(
        timelock,
        join,
        transfer
      )
    )
  }

  await propose(timelock, proposal, developer)
})()
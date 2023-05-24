import { getOwnerOrImpersonate, propose } from '../../../../shared/helpers'

import {
  Timelock__factory,
} from '../../../../typechain'

import { TIMELOCK } from '../../../../shared/constants'

import { sendTokens } from '../../../fragments/utils/sendTokens'
import { initPool } from '../../../fragments/pools/initPool'

const { developer, governance, baseTransfers, restoredSeries } = require(process.env.CONF as string)

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK)!, ownerAcc)

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []

  // Send base tokens to the pools
  for (let transfer of baseTransfers) {
    proposal = proposal.concat(await sendTokens(timelock, transfer))
  }

  // Initialize poola
  for (let series of restoredSeries) {
    proposal = proposal.concat(await initPool(ownerAcc, timelock, series))
  }

  await propose(timelock, proposal, developer)
})()
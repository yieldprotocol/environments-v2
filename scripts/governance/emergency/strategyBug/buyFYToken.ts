import { getOwnerOrImpersonate, propose } from '../../../../shared/helpers'

import {
  Timelock__factory,
  Strategy__factory,
  FYToken__factory,
  Join__factory,
} from '../../../../typechain'

import { TIMELOCK } from '../../../../shared/constants'

import { exitJoin } from '../../../fragments/emergency/exitJoin'
import { buyFYTokenFromStrategy } from '../../../fragments/emergency/buyFYTokenFromStrategy'

const { developer, governance, joins, baseTransfers } = require(process.env.CONF as string)

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK)!, ownerAcc)

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []

  // Send base tokens to the strategies and buy all FYToken
  for (let transfer of baseTransfers) {
    const strategy = Strategy__factory.connect(transfer.receiver, ownerAcc)
    const join = Join__factory.connect(joins.getOrThrow(transfer.token.assetId)!, ownerAcc)
    console.log(`strategy: ${strategy.address}`)
    const fyToken = FYToken__factory.connect(await strategy.fyToken(), ownerAcc)
    console.log(`fyToken available: ${await fyToken.balanceOf(strategy.address)}`)

    proposal = proposal.concat(await exitJoin(timelock, join, transfer))
    proposal = proposal.concat(await buyFYTokenFromStrategy(strategy, timelock.address))
  }

  await propose(timelock, proposal, developer)
})()
import { getOwnerOrImpersonate, propose } from '../../../../shared/helpers'

import {
  Timelock__factory,
  Strategy__factory,
} from '../../../../typechain'

import { TIMELOCK } from '../../../../shared/constants'

import { sendTokens } from '../../../fragments/utils/sendTokens'
import { burnDivestedStrategy } from '../../../fragments/emergency/burnDivestedStrategy'

const { developer, governance, strategyTransfers } = require(process.env
  .CONF as string)

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK)!, ownerAcc)

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []

  // Burn strategy tokens
  for (let transfer of strategyTransfers) {
    const strategy = Strategy__factory.connect(transfer.receiver, ownerAcc)
    console.log(`strategy token available: ${await strategy.balanceOf(timelock.address)}`)
    console.log(`strategy token burnt: ${transfer.amount}`)
    proposal = proposal.concat(await sendTokens(timelock, transfer))
    proposal = proposal.concat(await burnDivestedStrategy(strategy, timelock.address))
  }

  await propose(timelock, proposal, developer)
})()
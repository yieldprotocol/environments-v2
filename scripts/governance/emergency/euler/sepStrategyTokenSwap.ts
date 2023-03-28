import { getOwnerOrImpersonate, propose } from '../../../../shared/helpers'

import {
  Timelock__factory,
  ERC20__factory,
  TokenSwap__factory,
} from '../../../../typechain'

import { TIMELOCK, TOKEN_SWAP } from '../../../../shared/constants'

import { orchestrateTokenSwap } from '../../../fragments/utils/orchestrateTokenSwap'
import { registerSwap } from '../../../fragments/utils/registerSwap'
import { sendTokens } from '../../../fragments/utils/sendTokens'

import { Asset, Transfer } from '../../confTypes'

const { developer, deployers, governance, protocol, strategies, swaps } = require(process.env
  .CONF as string)

/**
 * @dev This script orchestrates the tokenSwap and registers swaps as needed
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK)!, ownerAcc)
  const tokenSwap = TokenSwap__factory.connect(protocol.getOrThrow(TOKEN_SWAP)!, ownerAcc)

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []

  // Orchestrate tokenSwap
  proposal = proposal.concat(
    await orchestrateTokenSwap(
      deployers.getOrThrow(tokenSwap.address),
      tokenSwap,
      timelock,
    )
  )

  // Register strategy token swaps
  for (let swap of swaps) {
    const tokenOut = ERC20__factory.connect(swap.tokenOut, ownerAcc)

    const transferAsset: Asset = {
      assetId: swap.tokenOut,
      address: strategies.getOrThrow(swap.tokenOut),
    }

    const transferAmount = await tokenOut.balanceOf(timelock.address)

    const transfer: Transfer = {
      token: transferAsset,
      receiver: tokenSwap.address,
      amount: transferAmount
    }

    proposal = proposal.concat(
      await sendTokens(
        timelock,
        transfer,
      )
    )

    proposal = proposal.concat(
      await registerSwap(
        tokenSwap,
        swap.tokenIn,
        swap.tokenOut,
      )
    )
  }

  await propose(timelock, proposal, developer)
})()

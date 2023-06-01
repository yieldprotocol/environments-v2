import { getOwnerOrImpersonate, propose } from '../../../../shared/helpers'

import {
  Timelock__factory,
  ERC20__factory,
  TokenUpgrade__factory,
} from '../../../../typechain'

import { TIMELOCK, TOKEN_UPGRADE } from '../../../../shared/constants'

import { orchestrateTokenUpgrade } from '../../../fragments/utils/orchestrateTokenUpgrade'
import { registerTokenUpgrade } from '../../../fragments/utils/registerTokenUpgrade'
import { sendTokens } from '../../../fragments/utils/sendTokens'

import { Asset, Transfer } from '../../confTypes'

const { developer, deployers, governance, protocol, strategies, upgrades } = require(process.env
  .CONF as string)

/**
 * @dev This script orchestrates the tokenUpgradeContract and registers upgrades as needed
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK)!, ownerAcc)
  const tokenUpgradeContract = TokenUpgrade__factory.connect(protocol.getOrThrow(TOKEN_UPGRADE)!, ownerAcc)

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []

  // Orchestrate tokenUpgradeContract
  proposal = proposal.concat(
    await orchestrateTokenUpgrade(
      deployers.getOrThrow(tokenUpgradeContract.address),
      tokenUpgradeContract,
      timelock,
    )
  )

  // Register strategy token upgrades
  for (let upgrade of upgrades) {
    const tokenInAddress = strategies.getOrThrow(upgrade.tokenIn)
    const tokenOutAddress = strategies.getOrThrow(upgrade.tokenOut)
    const tokenOut = ERC20__factory.connect(tokenOutAddress, ownerAcc)

    const transferAsset: Asset = {
      assetId: upgrade.tokenOut,
      address: tokenOutAddress,
    }

    const transferAmount = await tokenOut.balanceOf(timelock.address)

    const transfer: Transfer = {
      token: transferAsset,
      receiver: tokenUpgradeContract.address,
      amount: transferAmount
    }

    proposal = proposal.concat(
      await sendTokens(
        timelock,
        transfer,
      )
    )

    proposal = proposal.concat(
      await registerTokenUpgrade(
        tokenUpgradeContract,
        tokenInAddress,
        tokenOutAddress,
        upgrade.merkleRoot,
      )
    )
  }

  await propose(timelock, proposal, developer)
})()

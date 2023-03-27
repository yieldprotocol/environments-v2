import { getOwnerOrImpersonate, propose } from '../../../../../shared/helpers'
import { BigNumber } from 'ethers'
import {
  Timelock__factory,
  EmergencyBrake__factory,
  Cauldron__factory,
  Ladle__factory,
  Witch__factory,
  Strategy__factory,
  ERC20__factory,
  ERC20RewardsWrapper__factory,
} from '../../../../../typechain'

import { TIMELOCK, CLOAK, CAULDRON, LADLE, WITCH } from '../../../../../shared/constants'

import { orchestrateRewardsWrapper } from '../../../../fragments/strategies/orchestrateRewardsWrapper'
import { setRewardsToken } from '../../../../fragments/strategies/setRewardsToken'
import { setRewardsUnderlying } from '../../../../fragments/strategies/setRewardsUnderlying'
import { sendTokens } from '../../../../fragments/utils/sendTokens'
import { mintRewardsToken } from '../../../../fragments/strategies/mintRewardsToken'
import { addRewardsPlan } from '../../../../fragments/strategies/addRewardsPlan'

import { Transfer } from '../../../../governance/confTypes'

const { developer, deployers, governance, protocol, strategies, newRewards } = require(process.env.CONF as string)

/**
 * @dev This script sets the rewards wrappers for the strategies
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK)!, ownerAcc)
  const cloak = EmergencyBrake__factory.connect(governance.getOrThrow(CLOAK)!, ownerAcc)
  const cauldron = Cauldron__factory.connect(protocol.getOrThrow(CAULDRON)!, ownerAcc)
  const ladle = Ladle__factory.connect(protocol.getOrThrow(LADLE)!, ownerAcc)
  const witch = Witch__factory.connect(protocol.getOrThrow(WITCH)!, ownerAcc)

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []

  for (let rewards of newRewards) {
    const strategy = Strategy__factory.connect(strategies.getOrThrow(rewards.strategy.address)!, ownerAcc)
    const wrapper = ERC20RewardsWrapper__factory.connect(strategies.getOrThrow(rewards.wrapper.address)!, ownerAcc)
    const underlying = ERC20__factory.connect(strategies.getOrThrow(rewards.wrapper.underlying.address)!, ownerAcc)

    // Orchestrate new rewards wrappers
    proposal = proposal.concat(
      await orchestrateRewardsWrapper(deployers.getOrThrow('rewardsWrapper')!, timelock, wrapper)
    )

    // Set the wrappers as rewards for the strategies
    proposal = proposal.concat(await setRewardsToken(strategy, wrapper.address))

    // Set the underlying token for the wrappers
    proposal = proposal.concat(await setRewardsUnderlying(wrapper, underlying.address))

    // Transfer the underlying to the rewards wrapper
    const amount: BigNumber = BigNumber.from(rewards.current.rate * (rewards.current.stop - rewards.current.start))
    const transfer: Transfer = {
      token: rewards.wrapper.underlying,
      receiver: rewards.wrapper.address,
      amount: amount,
    }
    proposal = proposal.concat(await sendTokens(timelock, transfer))

    // Mint the rewards
    proposal = proposal.concat(await mintRewardsToken(strategy, amount))

    // Add the rewards plan for the strategies
    proposal = proposal.concat(await addRewardsPlan(strategy, rewards.current))
  }

  await propose(timelock, proposal, developer)
})()

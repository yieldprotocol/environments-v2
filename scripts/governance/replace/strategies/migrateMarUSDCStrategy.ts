import { getName, getOwnerOrImpersonate, id, indent, propose } from '../../../../shared/helpers'

import {
  Timelock__factory,
  Ladle__factory,
  ERC20__factory,
  StrategyV1__factory,
  Strategy__factory,
  Timelock,
  Ladle,
} from '../../../../typechain'

import { MULTISIG, TIMELOCK, LADLE, MAX256 } from '../../../../shared/constants'

import { orchestrateStrategy } from '../../../fragments/strategies/orchestrateStrategy'
import { investStrategy } from '../../../fragments/strategies/investStrategy'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

const { deployers, governance, pools, oldUSDCStrategies, newUSDCStrategies } = require(process.env.CONF as string)

/**
 * @dev This script orchestrates a new series and rolls liquidity in the related strategies
 */
export const migrateUSDCStrategy = async (
  timelock: Timelock,
  ladle: Ladle,
  ownerAcc: SignerWithAddress
): Promise<Array<{ target: string; data: string }>> => {
  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []

  // Orchestrate new strategies
  for (let strategy of newUSDCStrategies) {
    proposal = proposal.concat(
      await orchestrateStrategy(
        deployers.getOrThrow(strategy.address),
        governance.getOrThrow(MULTISIG)!,
        timelock,
        ladle,
        strategy,
        pools
      )
    )
  }
  let nesting = 0
  // Migrate funds from old strategies to new ones
  // @notice: This is a special case where we had to remove the `endPool` call from migrateStrategy fragment
  // because a user executed endPool before rolling could happen
  for (let strategy of oldUSDCStrategies) {
    console.log(indent(nesting, `MIGRATE_STRATEGY ${getName(strategy.assetId)}`))
    // Build the proposal

    const oldStrategyAddress = strategy.address
    const newStrategyAddress = strategy.seriesToInvest.address

    console.log(indent(nesting, `Using Strategy V1 at ${oldStrategyAddress}`))

    const oldStrategy = StrategyV1__factory.connect(oldStrategyAddress, ownerAcc)
    const newStrategy = Strategy__factory.connect(newStrategyAddress, ownerAcc)
    const newSeries = strategy.seriesToInvest.seriesToInvest!

    console.log(indent(nesting, `Using Strategy V2 at ${newStrategyAddress} for ${newSeries.seriesId}`))

    // Allow the old strategy to init the new strategy
    proposal.push({
      target: newStrategy.address,
      data: newStrategy.interface.encodeFunctionData('grantRoles', [
        [id(newStrategy.interface, 'mint(address,address,uint256,uint256)')],
        oldStrategy.address,
      ]),
    })
    console.log(indent(nesting, `strategy ${newStrategyAddress} grantRoles(mint, ${oldStrategyAddress})`))

    // Set the new strategy as the pool for the old strategy
    proposal.push({
      target: oldStrategy.address,
      data: oldStrategy.interface.encodeFunctionData('setNextPool', [newStrategyAddress, newSeries.seriesId]),
    })
    console.log(indent(nesting, `Next pool on ${oldStrategy.address} set as ${newStrategyAddress}`))

    // Supply new strategy with a wei of underlying for initialization
    const base = ERC20__factory.connect(await oldStrategy.base(), (await ethers.getSigners())[0])
    proposal.push({
      target: base.address,
      data: base.interface.encodeFunctionData('transfer', [newStrategyAddress, 1]),
    })
    console.log(indent(nesting, `Transferring ${1} of ${await base.symbol()} from Timelock to ${newStrategyAddress}`))

    // Migrate
    proposal.push({
      target: oldStrategy.address,
      data: oldStrategy.interface.encodeFunctionData('startPool', [0, MAX256]),
    })

    console.log(indent(nesting, `Strategy ${oldStrategyAddress} rolled onto ${newStrategyAddress}`))

    // Revoke init permissions from the old strategy
    proposal.push({
      target: newStrategy.address,
      data: newStrategy.interface.encodeFunctionData('revokeRoles', [
        [id(newStrategy.interface, 'mint(address,address,uint256,uint256)')],
        oldStrategy.address,
      ]),
    })
    console.log(indent(nesting, `strategy ${newStrategyAddress} revokeRoles(mint, ${oldStrategyAddress})`))
  }

  // Invest new strategies
  for (let strategy of newUSDCStrategies) {
    proposal = proposal.concat(await investStrategy(ownerAcc, strategy))
  }
  return proposal
}

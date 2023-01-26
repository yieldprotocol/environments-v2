/**
 * @dev This script migrates strategies from v1 to v2.
 */
import { id } from '@yield-protocol/utils-v2'
import { ERC20__factory, Strategy__factory, StrategyV1__factory, Pool__factory } from '../../../typechain'
import { MAX256 } from '../../../shared/constants'
import { ethers } from 'hardhat'
import { Strategy_V1 } from '../../governance/confTypes'
import { indent, getName } from '../../../shared/helpers'

export const migrateStrategy = async (
  ownerAcc: any,
  strategy: Strategy_V1,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `MIGRATE_STRATEGY ${getName(strategy.assetId)}`))
  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []

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

  // Divest the old strategy
  proposal.push({
    target: oldStrategy.address,
    data: oldStrategy.interface.encodeFunctionData('endPool'),
  })
  console.log(indent(nesting, `${oldStrategy.address} divested`))

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

  return proposal
}

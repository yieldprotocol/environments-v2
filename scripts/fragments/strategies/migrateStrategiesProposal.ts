/**
 * @dev This script migrates strategies from v1 to v2.
 */
import { id } from '@yield-protocol/utils-v2'
import {
  ERC20__factory,
  Strategy__factory,
  StrategyV1__factory,
  Pool__factory,
  FYToken__factory,
} from '../../../typechain'
import { MAX256 } from '../../../shared/constants'
import { ethers } from 'hardhat'

export const migrateStrategiesProposal = async (
  ownerAcc: any,
  migrateData: Array<[string, string, string, string]>
): Promise<Array<{ target: string; data: string }>> => {
  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []

  for (let [oldStrategyAddress, newSeriesId, newStrategyAddress, newPoolAddress] of migrateData) {
    console.log(`Using Strategy V1 at ${oldStrategyAddress}`)

    const oldStrategy = StrategyV1__factory.connect(oldStrategyAddress, ownerAcc)
    const newStrategy = Strategy__factory.connect(newStrategyAddress, ownerAcc)

    console.log(`Using Strategy V2 at ${newStrategyAddress} for ${newSeriesId}`)

    // Allow the old strategy to init the new strategy
    proposal.push({
      target: newStrategy.address,
      data: newStrategy.interface.encodeFunctionData('grantRoles', [
        [id(newStrategy.interface, 'mint(address,address,uint256,uint256)')],
        oldStrategy.address,
      ]),
    })
    console.log(`strategy ${newStrategyAddress} grantRoles(mint, ${oldStrategyAddress})`)

    // Set the new strategy as the pool for the old strategy
    proposal.push({
      target: oldStrategy.address,
      data: oldStrategy.interface.encodeFunctionData('setNextPool', [newStrategyAddress, newSeriesId]),
    })
    console.log(`Next pool on ${oldStrategy.address} set as ${newStrategyAddress}`)

    // Divest the old strategy
    proposal.push({
      target: oldStrategy.address,
      data: oldStrategy.interface.encodeFunctionData('endPool'),
    })
    console.log(`${oldStrategy.address} divested`)

    // Supply new strategy with a wei of underlying for initialization
    const base = ERC20__factory.connect(await oldStrategy.base(), (await ethers.getSigners())[0])
    proposal.push({
      target: base.address,
      data: base.interface.encodeFunctionData('transfer', [newStrategyAddress, 1]),
    })
    console.log(`Transferring ${1} of ${await base.symbol()} from Timelock to ${newStrategyAddress}`)

    // Migrate
    proposal.push({
      target: oldStrategy.address,
      data: oldStrategy.interface.encodeFunctionData('startPool', [0, MAX256]),
    })

    console.log(`Strategy ${oldStrategyAddress} rolled onto ${newStrategyAddress}`)

    // Revoke init permissions from the old strategy
    proposal.push({
      target: newStrategy.address,
      data: newStrategy.interface.encodeFunctionData('revokeRoles', [
        [id(newStrategy.interface, 'mint(address,address,uint256,uint256)')],
        oldStrategy.address,
      ]),
    })
    console.log(`strategy ${newStrategyAddress} grantRoles(mint, ${oldStrategyAddress})`)

    const newPool = Pool__factory.connect(newPoolAddress, ownerAcc)

    // Allow new strategy to init the new pool
    proposal.push({
      target: newPool.address,
      data: newPool.interface.encodeFunctionData('grantRoles', [
        [id(newPool.interface, 'init(address)')],
        newStrategy.address,
      ]),
    })
    console.log(`pool ${newPoolAddress} grantRoles(init, ${newStrategyAddress})`)

    // Invest
    proposal.push({
      target: newStrategy.address,
      data: newStrategy.interface.encodeFunctionData('invest', [newPoolAddress]),
    })

    console.log(`Strategy ${newStrategy.address} invested onto ${newPoolAddress}`)
  }

  return proposal
}

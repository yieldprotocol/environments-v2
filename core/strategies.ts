import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { id } from '@yield-protocol/utils-v2'
import { verify } from '../shared/helpers'

import { ethers, waffle } from 'hardhat'

import StrategyArtifact from '../artifacts/@yield-protocol/strategy-v2/contracts/Strategy.sol/Strategy.json'

import { Strategy } from '../typechain/Strategy'
import { Ladle } from '../typechain/Ladle'
import { Timelock } from '../typechain/Timelock'

const { deployContract } = waffle

export async function strategyGovAuth(strategy: Strategy, receiver: string) {
  await strategy.grantRoles(
    [
      await strategy.ROOT(),
      id(strategy.interface, 'setRewardsToken(address)'),
      id(strategy.interface, 'setRewards(uint32,uint32,uint96)'),
      id(strategy.interface, 'setYield(address)'),
      id(strategy.interface, 'setTokenId(bytes6)'),
      id(strategy.interface, 'resetTokenJoin()'),
      id(strategy.interface, 'setNextPool(address,bytes6)'),
    ],
    receiver
  )
}

export async function setup(
    owner: SignerWithAddress,
    ladle: Ladle,
    timelock: Timelock,
    assets: Map<string, string>,
    strategiesData: Array<[string, string, string]>, // name, symbol, baseId
  ) {

    const strategies: Map<string, Strategy> = new Map()

    for (let [name, symbol, baseId] of strategiesData) {
      const baseAddress = assets.get(baseId) as string
      const strategy = (await deployContract(owner, StrategyArtifact, [name, symbol, 18, ladle.address, baseAddress, baseId])) as Strategy
      console.log(`[Strategy, '${strategy.address}'],`)
      verify(strategy.address, [name, symbol, 18, ladle.address, baseAddress, baseId])

      await strategyGovAuth(strategy, timelock.address); console.log(`Timelock permissions`)

      strategies.set(symbol, strategy)
    }

    return strategies
}
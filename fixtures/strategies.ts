import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import *  as fs from 'fs'
import { DAI } from '../shared/constants'
import { id } from '@yield-protocol/utils-v2'
import { jsonToMap } from '../shared/helpers'
import { verify } from '../shared/helpers'

import { ethers, waffle } from 'hardhat'

import StrategyArtifact from '../artifacts/@yield-protocol/strategy-v2/contracts/Strategy.sol/Strategy.json'

import { Strategy } from '../typechain/Strategy'
import { Ladle } from '../typechain/Ladle'
import { Timelock } from '../typechain/Timelock'
import { ERC20Mock } from '../typechain/ERC20Mock'

const { deployContract } = waffle

export async function strategyGovAuth(strategy: Strategy, receiver: string) {
  await strategy.grantRoles(
    [
      id('setRewardsToken(address)'),
      id('setRewards(uint32,uint32,uint96)'),
      id('setYield(address,address)'),
      id('setTokenId(bytes6)'),
      id('resetTokenJoin()'),
      id('setNextPool(address,bytes6)'),
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

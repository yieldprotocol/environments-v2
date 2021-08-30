import { ethers, waffle } from 'hardhat'
import *  as fs from 'fs'
import { DAI } from '../shared/constants'
import { id } from '@yield-protocol/utils-v2'
import { jsonToMap } from '../shared/helpers'
import { verify } from '../shared/helpers'

import StrategyArtifact from '../artifacts/@yield-protocol/strategy-v2/contracts/Strategy.sol/Strategy.json'

import { Strategy } from '../typechain/Strategy'
import { Ladle } from '../typechain/Ladle'
import { TimeLock } from '../typechain/TimeLock'
import { Cauldron } from '../typechain/Cauldron'

const { deployContract } = waffle

async function strategyGovAuth(strategy: Strategy, receiver: string) {
  await strategy.grantRoles(
    [
      id('setYield(address,address)'),
      id('setTokenId(bytes6)'),
      id('resetTokenJoin()'),
      id('setNextPool(address,bytes6)'),
    ],
    receiver
  )
}


(async () => {
  const [ owner ] = await ethers.getSigners();
  const assets = jsonToMap(fs.readFileSync('./output/assets.json', 'utf8')) as Map<string,string>;
  const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string, string>;
  const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string, string>;

  const ladle = await ethers.getContractAt('Ladle', protocol.get('ladle') as string, owner) as unknown as Ladle
  const timelock = await ethers.getContractAt('TimeLock', governance.get('timelock') as string, owner) as unknown as TimeLock
  const baseAddress = assets.get(DAI) as string // TODO: This should be a parameter

  // TODO: More parameters below
  const strategy = (await deployContract(owner, StrategyArtifact, ['Strategy', 'YST', 18, ladle.address, baseAddress, DAI])) as Strategy
  console.log(`[Strategy, '${strategy.address}'],`)
  verify(strategy.address, ['Strategy', 'YST', 18, ladle.address, baseAddress, DAI])

  await strategyGovAuth(strategy, timelock.address); console.log(`Timelock permissions`)
})()

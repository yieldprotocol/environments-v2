import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { WAD } from '../shared/constants'
import { jsonToMap } from '../shared/helpers'
import { seriesData } from '../environments/config'

import { Strategy } from '../typechain/Strategy'
import { ERC20Mock } from '../typechain/ERC20Mock'

(async () => {
  const [ owner ] = await ethers.getSigners();
  const pools = jsonToMap(fs.readFileSync('./output/pools.json', 'utf8')) as Map<string,string>;
  const strategies = jsonToMap(fs.readFileSync('./output/strategies.json', 'utf8')) as Map<string,string>;

  const [DAI1, , , ] = seriesData[0]
  const [DAI2, , , ] = seriesData[1]
  const poolDAI1 = pools.get(DAI1) as string
  const poolDAI2 = pools.get(DAI2) as string

  const strategy = await ethers.getContractAt('Strategy', strategies.get('DAI3M') as string, owner) as unknown as Strategy
  const base = await ethers.getContractAt('ERC20Mock', await strategy.base() as string, owner) as unknown as ERC20Mock

  await base.mint(strategy.address, WAD.mul(100000))
  await strategy.setNextPool(poolDAI1, DAI1)          ; console.log(`setNextPool, '${poolDAI1}',`)
  await strategy.startPool()                          ; console.log(`startPool, '${poolDAI1}',`)
  await strategy.setNextPool(poolDAI2, DAI2)          ; console.log(`setNextPool, '${poolDAI2}',`)
})()

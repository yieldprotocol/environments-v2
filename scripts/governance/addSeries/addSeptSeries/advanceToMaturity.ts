import { ethers } from 'hardhat'
import { readAddressMappingIfExists, getOwnerOrImpersonate, getOriginalChainId } from '../../../../shared/helpers'

import { Strategy, Pool } from '../../../../typechain'
const { developer, rollData } = require(process.env.CONF as string)

/**
 * @dev This script advances time until maturity of the first strategy
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  for (let [strategyId] of rollData) {
    const strategies = readAddressMappingIfExists('strategies.json')
    const strategyAddress = strategies.get(strategyId)
    if (strategyAddress === undefined) throw `Strategy for ${strategyId} not found`
    else console.log(`Using strategy at ${strategyAddress} for ${strategyId}`)
    const strategy = (await ethers.getContractAt('Strategy', strategyAddress, ownerAcc)) as Strategy

    const poolAddress = await strategy.pool()
    const pool = (await ethers.getContractAt('Pool', poolAddress, ownerAcc)) as Pool
    console.log(`Advancing to maturity of pool ${poolAddress} on ${await pool.maturity()}`)

    await ethers.provider.send('evm_mine', [await pool.maturity()])
    break
  }
})()

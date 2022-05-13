import { ethers } from 'hardhat'
import { readAddressMappingIfExists, getOwnerOrImpersonate, getOriginalChainId } from '../../../../shared/helpers'

import { Strategy, Pool } from '../../../../typechain'
import { developer, rollData } from './addJuneSeries.mainnet.config'

/**
 * @dev This script advances time until maturity of the first strategy
 */
;(async () => {
  const chainId = await getOriginalChainId()

  let ownerAcc = await getOwnerOrImpersonate(developer)

  const [strategyId] = rollData[0]

  const strategies = readAddressMappingIfExists('strategies.json')
  const strategyAddress = strategies.get(strategyId)
  if (strategyAddress === undefined) throw `Strategy for ${strategyId} not found`
  else console.log(`Using strategy at ${strategyAddress} for ${strategyId}`)
  const strategy = (await ethers.getContractAt('Strategy', strategyAddress, ownerAcc)) as Strategy

  const poolAddress = await strategy.pool()
  const pool = (await ethers.getContractAt('Pool', poolAddress, ownerAcc)) as Pool
  console.log(`Advancing to maturity of pool ${poolAddress} on ${await pool.maturity()}`)

  await ethers.provider.send('evm_mine', [await pool.maturity()])
})()

import { advanceTime, bytesToString, getOwnerOrImpersonate } from '../../../shared/helpers'
import { POOL_ORACLE } from '../../../shared/constants'
import { ethers, network } from 'hardhat'
import { AuctionLineAndLimit } from '../../governance/confTypes'
import { PoolOracle__factory } from '../../../typechain/factories/contracts/PoolOracle__factory'

const { developer, protocol, pools, auctionLineAndLimits } = require(process.env.CONF!)

/**
 * @dev This script initialises the PoolOracle (takes a TWAR snapshot) for a given set of ilkIds.
 */
;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)

  const poolOracle = PoolOracle__factory.connect(protocol.get(POOL_ORACLE)!, ownerAcc)

  const ilkIds = new Set((auctionLineAndLimits as AuctionLineAndLimit[]).map(({ ilkId }) => ilkId))
  for (const ilkId of ilkIds) {
    const pool = pools.get(ilkId)!
    if ((await ethers.provider.getCode(pool)) === '0x') throw `Pool Address ${pool} contains no code`

    const tx = await poolOracle.update(pool)
    tx.wait(1)

    console.log(`Initialised PoolOracle for pool: ${bytesToString(ilkId)}-${pool}`)
  }

  if (network.name === 'localhost' || network.name.includes('tenderly')) {
    // Since we are in a testing environment, let's advance time so calling the oracle doesn't blow up
    advanceTime((await poolOracle.minTimeElapsed()).toNumber() + 60)
  }
})()

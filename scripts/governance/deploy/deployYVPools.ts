import { ethers } from 'hardhat'
import { writeAddressMap, getOwnerOrImpersonate } from '../../../shared/helpers'

import { deployYVPools } from '../../fragments/assetsAndSeries/deployYVPools'
import { YieldMath } from '../../../typechain'
const { protocol } = require(process.env.CONF as string)
const { developer, yvPoolData } = require(process.env.CONF as string)

/**
 * @dev This script deploys Pools
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const yieldMath = (await ethers.getContractAt(
    '@yield-protocol/yieldspace-tv/src/YieldMath.sol:YieldMath',
    protocol.get('yieldMath') as string,
    ownerAcc
  )) as unknown as YieldMath

  const newPools = await deployYVPools(ownerAcc, yieldMath, yvPoolData)
  writeAddressMap('newPools.json', newPools) // newPools.json is a temporary file
})()

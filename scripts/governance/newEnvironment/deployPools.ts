import { ethers } from 'hardhat'
import { writeAddressMap, getOwnerOrImpersonate } from '../../../shared/helpers'

import { deployPools } from '../../fragments/assetsAndSeries/deployPools'
import { YieldMath } from '../../../typechain'
const { protocol } = require(process.env.CONF as string)
const { developer, poolData } = require(process.env.CONF as string)

/**
 * @dev This script deploys Pools
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const yieldMath = (await ethers.getContractAt(
    'YieldMath',
    protocol.get('yieldMath') as string,
    ownerAcc
  )) as unknown as YieldMath

  const newPools = await deployPools(ownerAcc, yieldMath, poolData)
  writeAddressMap('newPools.json', newPools) // newPools.json is a tempporary file
})()

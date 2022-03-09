import { ethers } from 'hardhat'
import {
  readAddressMappingIfExists,
  writeAddressMap,
  getOwnerOrImpersonate,
  getOriginalChainId,
} from '../../../shared/helpers'

import { deployPools } from '../../fragments/assetsAndSeries/deployPools'
import { YieldMath } from '../../../typechain'
const { developer, poolData } = require(process.env.CONF as string)

/**
 * @dev This script deploys Pools
 */

;(async () => {
  const chainId = await getOriginalChainId()
  let ownerAcc = await getOwnerOrImpersonate(developer)
  const protocol = readAddressMappingIfExists('protocol.json')

  const yieldMath = (await ethers.getContractAt(
    'YieldMath',
    protocol.get('yieldMath') as string,
    ownerAcc
  )) as unknown as YieldMath

  const newPools = await deployPools(ownerAcc, yieldMath, poolData)
  writeAddressMap('newPools.json', newPools) // newPools.json is a tempporary file
})()

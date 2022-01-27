import { ethers } from 'hardhat'
import { readAddressMappingIfExists, writeAddressMap, getOwnerOrImpersonate, getOriginalChainId } from '../../../shared/helpers'

import { deployPools } from '../../fragments/assetsAndSeries/deployPools'
import { YieldMath } from '../../../typechain'
import { developer, poolData } from './arbitrum/newEnvironment.arb_rinkeby.config'

/**
 * @dev This script deploys Pools
 */

;(async () => {
  const chainId = await getOriginalChainId()
  let ownerAcc = await getOwnerOrImpersonate(developer)
  const protocol = readAddressMappingIfExists('protocol.json');

  const yieldMath = (await ethers.getContractAt(
    'YieldMath',
    protocol.get('yieldMath') as string,
    ownerAcc
  )) as unknown as YieldMath

  const pools = await deployPools(ownerAcc, yieldMath, poolData)
  writeAddressMap('pools.json', pools); // pools.json is a tempporary file
})()

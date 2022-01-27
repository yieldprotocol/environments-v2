import { ethers } from 'hardhat'
import { readAddressMappingIfExists, writeAddressMap, getOwnerOrImpersonate, getOriginalChainId } from '../../../shared/helpers'

import { deployYieldMath } from '../../fragments/core/libraries/deployYieldMath'

import { developer } from './arbitrum/newEnvironment.arb_rinkeby.config'

/**
 * @dev This script deploys the YieldMath
 */

;(async () => {
  const chainId = await getOriginalChainId()

  let ownerAcc = await getOwnerOrImpersonate(developer as string)
  const protocol = readAddressMappingIfExists('protocol.json');

  const yieldMath = await deployYieldMath(ownerAcc, protocol)
  protocol.set('yieldMath', yieldMath.address)

  writeAddressMap('protocol.json', protocol);
})()

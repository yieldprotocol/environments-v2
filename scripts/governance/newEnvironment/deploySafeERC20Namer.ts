import { ethers } from 'hardhat'
import { readAddressMappingIfExists, writeAddressMap, getOwnerOrImpersonate, getOriginalChainId } from '../../../shared/helpers'

import { deploySafeERC20Namer } from '../../fragments/core/libraries/deploySafeERC20Namer'

import { developer } from './arbitrum/newEnvironment.arb_rinkeby.config'

/**
 * @dev This script deploys the SafeERC20Namer
 */

;(async () => {
  const chainId = await getOriginalChainId()

  let ownerAcc = await getOwnerOrImpersonate(developer as string)
  const protocol = readAddressMappingIfExists('protocol.json');

  const safeERC20Namer = await deploySafeERC20Namer(ownerAcc, protocol)
  protocol.set('safeERC20Namer', safeERC20Namer.address)

  writeAddressMap('protocol.json', protocol);
})()

import { ethers } from 'hardhat'
import { readAddressMappingIfExists, writeAddressMap, getOwnerOrImpersonate, getOriginalChainId } from '../../../shared/helpers'

import { deployTimelock } from '../../fragments/core/governance/deployTimelock'

import { developer } from './arbitrum/newEnvironment.arb_rinkeby.config'

/**
 * @dev This script deploys the Timelock
 */

;(async () => {
  const chainId = await getOriginalChainId()

  let ownerAcc = await getOwnerOrImpersonate(developer as string)
  const protocol = readAddressMappingIfExists('protocol.json');
  const governance = readAddressMappingIfExists('governance.json');

  const timelock = await deployTimelock(ownerAcc, governance)
  protocol.set('timelock', timelock.address)

  writeAddressMap('protocol.json', protocol);
})()

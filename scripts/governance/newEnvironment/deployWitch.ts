import { ethers } from 'hardhat'
import { readAddressMappingIfExists, writeAddressMap, getOwnerOrImpersonate, getOriginalChainId } from '../../../shared/helpers'

import { deployWitch } from '../../fragments/core/deployWitch'
import { developer } from './arbitrum/newEnvironment.arb_rinkeby.config'

/**
 * @dev This script deploys the Witch
 */

;(async () => {
  const chainId = await getOriginalChainId()

  let ownerAcc = await getOwnerOrImpersonate(developer as string)
  const protocol = readAddressMappingIfExists('protocol.json');
  const governance = readAddressMappingIfExists('governance.json');

  const witch = await deployWitch(ownerAcc, protocol, governance)
  protocol.set('witch', witch.address)

  writeAddressMap('protocol.json', protocol);
})()

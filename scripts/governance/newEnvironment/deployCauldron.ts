import { ethers } from 'hardhat'
import { readAddressMappingIfExists, writeAddressMap, getOwnerOrImpersonate, getOriginalChainId } from '../../../shared/helpers'

import { deployCauldron } from '../../fragments/core/deployCauldron'
import { developer } from './arbitrum/newEnvironment.arb_rinkeby.config'

/**
 * @dev This script deploys the Cauldron
 */

;(async () => {
  const chainId = await getOriginalChainId()

  let ownerAcc = await getOwnerOrImpersonate(developer as string)
  const protocol = readAddressMappingIfExists('protocol.json');
  const governance = readAddressMappingIfExists('governance.json');

  const cauldron = await deployCauldron(ownerAcc, protocol, governance)
  protocol.set('cauldron', cauldron.address)

  writeAddressMap('protocol.json', protocol);
})()

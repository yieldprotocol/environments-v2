import { ethers } from 'hardhat'
import { readAddressMappingIfExists, writeAddressMap, getOwnerOrImpersonate, getOriginalChainId } from '../../../shared/helpers'

import { deployYieldMathExtensions } from '../../fragments/core/libraries/deployYieldMathExtensions'

import { YieldMath } from '../../../typechain'
import { developer } from './arbitrum/newEnvironment.arb_rinkeby.config'

/**
 * @dev This script deploys the YieldMathExtensions
 */

;(async () => {
  const chainId = await getOriginalChainId()

  let ownerAcc = await getOwnerOrImpersonate(developer as string)
  const protocol = readAddressMappingIfExists('protocol.json');

  const yieldMath = (await ethers.getContractAt(
    'YieldMath',
    protocol.get('yieldMath') as string,
    ownerAcc
  )) as unknown as YieldMath

  const yieldMathExtensions = await deployYieldMathExtensions(ownerAcc, yieldMath, protocol)
  protocol.set('yieldMathExtensions', yieldMathExtensions.address)

  writeAddressMap('protocol.json', protocol);
})()

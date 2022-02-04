import { ethers } from 'hardhat'
import { readAddressMappingIfExists, writeAddressMap, getOwnerOrImpersonate, getOriginalChainId } from '../../../shared/helpers'

import { deployPoolView } from '../../fragments/core/libraries/deployPoolView'

import { YieldMathExtensions } from '../../../typechain'
const { developer } = require(process.env.CONF as string)

/**
 * @dev This script deploys the PoolView
 */

;(async () => {
  const chainId = await getOriginalChainId()

  let ownerAcc = await getOwnerOrImpersonate(developer as string)
  const protocol = readAddressMappingIfExists('protocol.json');

  const yieldMathExtensions = (await ethers.getContractAt(
    'YieldMathExtensions',
    protocol.get('yieldMathExtensions') as string,
    ownerAcc
  )) as unknown as YieldMathExtensions

  const poolView = await deployPoolView(ownerAcc, yieldMathExtensions, protocol)
  protocol.set('poolView', poolView.address)

  writeAddressMap('protocol.json', protocol);
})()

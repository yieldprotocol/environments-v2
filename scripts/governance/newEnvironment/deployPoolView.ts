import { ethers } from 'hardhat'
import { writeAddressMap, getOwnerOrImpersonate } from '../../../shared/helpers'

import { deployPoolView } from '../../fragments/core/libraries/deployPoolView'

import { YieldMathExtensions } from '../../../typechain'
const { protocol } = require(process.env.CONF as string)
const { developer } = require(process.env.CONF as string)

/**
 * @dev This script deploys the PoolView
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)

  const yieldMathExtensions = (await ethers.getContractAt(
    'YieldMathExtensions',
    protocol.get('yieldMathExtensions') as string,
    ownerAcc
  )) as unknown as YieldMathExtensions

  const poolView = await deployPoolView(ownerAcc, yieldMathExtensions, protocol)
  protocol.set('poolView', poolView.address)

  writeAddressMap('protocol.json', protocol)
})()

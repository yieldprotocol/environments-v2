import { ethers } from 'hardhat'
import {
  writeAddressMap,
  getOwnerOrImpersonate,
} from '../../../shared/helpers'

import { deployYieldMathExtensions } from '../../fragments/core/libraries/deployYieldMathExtensions'

import { YieldMath } from '../../../typechain'
const { protocol } = require(process.env.CONF as string)
const { developer } = require(process.env.CONF as string)

/**
 * @dev This script deploys the YieldMathExtensions
 */

;(async () => {

  let ownerAcc = await getOwnerOrImpersonate(developer as string)

  const yieldMath = (await ethers.getContractAt(
    'YieldMath',
    protocol.get('yieldMath') as string,
    ownerAcc
  )) as unknown as YieldMath

  const yieldMathExtensions = await deployYieldMathExtensions(ownerAcc, yieldMath, protocol)
  protocol.set('yieldMathExtensions', yieldMathExtensions.address)

  writeAddressMap('protocol.json', protocol)
})()

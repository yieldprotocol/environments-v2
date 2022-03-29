import {
  writeAddressMap,
  getOwnerOrImpersonate,
} from '../../../shared/helpers'

import { deploySafeERC20Namer } from '../../fragments/core/libraries/deploySafeERC20Namer'
const { protocol } = require(process.env.CONF as string)
const { developer } = require(process.env.CONF as string)

/**
 * @dev This script deploys the SafeERC20Namer
 */

;(async () => {

  let ownerAcc = await getOwnerOrImpersonate(developer as string)

  const safeERC20Namer = await deploySafeERC20Namer(ownerAcc, protocol)
  protocol.set('safeERC20Namer', safeERC20Namer.address)

  writeAddressMap('protocol.json', protocol)
})()

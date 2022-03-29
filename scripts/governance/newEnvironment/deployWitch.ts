import {
  writeAddressMap,
  getOwnerOrImpersonate,
} from '../../../shared/helpers'

import { deployWitch } from '../../fragments/core/deployWitch'
const { protocol, governance } = require(process.env.CONF as string)
const { developer } = require(process.env.CONF as string)

/**
 * @dev This script deploys the Witch
 */

;(async () => {

  let ownerAcc = await getOwnerOrImpersonate(developer as string)

  const witch = await deployWitch(ownerAcc, protocol, governance)
  protocol.set('witch', witch.address)

  writeAddressMap('protocol.json', protocol)
})()

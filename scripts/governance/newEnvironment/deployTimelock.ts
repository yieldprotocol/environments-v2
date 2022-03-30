import { writeAddressMap, getOwnerOrImpersonate } from '../../../shared/helpers'

import { deployTimelock } from '../../fragments/core/governance/deployTimelock'
const { protocol, governance } = require(process.env.CONF as string)
const { developer } = require(process.env.CONF as string)

/**
 * @dev This script deploys the Timelock
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)

  const timelock = await deployTimelock(ownerAcc, governance)
  protocol.set('timelock', timelock.address)

  writeAddressMap('protocol.json', protocol)
})()

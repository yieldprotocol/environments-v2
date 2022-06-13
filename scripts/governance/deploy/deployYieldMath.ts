import { writeAddressMap, writeVerificationHelper, getOwnerOrImpersonate } from '../../../shared/helpers'

import { deployYieldMath } from '../../fragments/core/libraries/deployYieldMath'

const { protocol } = require(process.env.CONF as string)
const { developer } = require(process.env.CONF as string)

/**
 * @dev This script deploys the YieldMath
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)

  const yieldMath = await deployYieldMath(ownerAcc, protocol)
  protocol.set('yieldMath', yieldMath.address)

  writeAddressMap('protocol.json', protocol)
  writeVerificationHelper('YieldMath', yieldMath.address)
})()

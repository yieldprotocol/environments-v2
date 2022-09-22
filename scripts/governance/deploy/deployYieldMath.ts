import { writeAddressMap, writeVerificationHelper, getOwnerOrImpersonate } from '../../../shared/helpers'
import { WAD } from '../../../shared/constants'

import { deployYieldMath } from '../../fragments/core/libraries/deployYieldMath'

const { protocol } = require(process.env.CONF as string)
const { developer } = require(process.env.CONF as string)

/**
 * @dev This script deploys the YieldMath
 */

;(async () => {
  console.log(developer)
  let ownerAcc = await getOwnerOrImpersonate(developer as string, WAD)
  const bal = await ownerAcc.getBalance()

  console.log('deployer eth balance:', bal)
  console.log('here')
  const yieldMath = await deployYieldMath(ownerAcc, protocol)
  console.log('here2')
  protocol.set('yieldMath', yieldMath.address)

  writeAddressMap('protocol.json', protocol)
  writeVerificationHelper('YieldMath', yieldMath.address)
})()

import { witchV2_key } from '../../../../shared/constants'
import { writeAddressMap, getOwnerOrImpersonate } from '../../../../shared/helpers'
import { deployWitchV2 } from '../shared/deployWitchV2'

const { protocol, governance } = require(process.env.CONF as string)
const { developer } = require(process.env.CONF as string)

/**
 * @dev This script deploys the Witch
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)
  const witchV2 = await deployWitchV2(ownerAcc, protocol, governance)
  protocol.set(witchV2_key, witchV2.address)

  writeAddressMap('protocol.json', protocol)
})()

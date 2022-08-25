import { contangoWitch_key } from '../../../../shared/constants'
import { writeAddressMap, getOwnerOrImpersonate } from '../../../../shared/helpers'
import { deployContangoWitch } from '../shared/deployContangoWitch'

const { developer, contangoAddress, protocol, governance } = require(process.env.CONF as string)

/**
 * @dev This script deploys the Witch
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)
  const contangoWitch = await deployContangoWitch(ownerAcc, protocol, governance, contangoAddress)
  protocol.set(contangoWitch_key, contangoWitch.address)

  writeAddressMap('protocol.json', protocol)
})()

import { CONTANGO_WITCH } from '../../../../../shared/constants'
import { writeAddressMap, getOwnerOrImpersonate } from '../../../../../shared/helpers'
import { deployContangoWitch } from '../../shared/deployContangoWitch'

const { developer, protocol, governance, external } = require(process.env.CONF as string)

/**
 * @dev This script deploys the Witch
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)
  const contangoWitch = await deployContangoWitch(ownerAcc, protocol, governance, external.get('contango') as string)
  protocol.set(CONTANGO_WITCH, contangoWitch.address)

  writeAddressMap('protocol.json', protocol)
})()

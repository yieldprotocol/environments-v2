import { contangoWitch_key } from '../../../../shared/constants'
import { writeAddressMap, getOwnerOrImpersonate } from '../../../../shared/helpers'
import { deployContangoWitch } from '../shared/deployContangoWitch'

const { developer, protocol, governance, contracts } = require(process.env.CONF as string)

/**
 * @dev This script deploys the Witch
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)
  const contangoWitch = await deployContangoWitch(ownerAcc, protocol, governance, contracts.get('contango') as string)
  protocol.set(contangoWitch_key, contangoWitch.address)

  writeAddressMap('protocol.json', protocol)
})()

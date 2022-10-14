import { CONTANGO_LADLE_ROUTER, CONTANGO_LADLE } from '../../../../../shared/constants'
import { getOwnerOrImpersonate, writeAddressMap } from '../../../../../shared/helpers'

import { deployContangoLadle } from '../../shared/deployContangoLadle'
const { developer, protocol, governance, assets } = require(process.env.CONF as string)
import { ETH } from '../../../../../shared/constants'

/**
 * @dev This script deploys the Ladle
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)

  const ladle = await deployContangoLadle(ownerAcc, assets.get(ETH), protocol, governance)
  protocol.set(CONTANGO_LADLE, ladle.address)

  const router = await ladle.router()
  protocol.set(CONTANGO_LADLE_ROUTER, router)

  writeAddressMap('protocol.json', protocol)
})()

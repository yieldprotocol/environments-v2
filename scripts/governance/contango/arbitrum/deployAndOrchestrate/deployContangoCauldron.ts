import { CONTANGO_CAULDRON } from '../../../../../shared/constants'
import { getOwnerOrImpersonate, writeAddressMap } from '../../../../../shared/helpers'
import { deployContangoCauldron } from '../../shared/deployContangoCauldron'

const { protocol, governance } = require(process.env.CONF as string)
const { developer } = require(process.env.CONF as string)

/**
 * @dev This script deploys the Cauldron
 */

;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer as string)
  const contangoCauldron = await deployContangoCauldron(ownerAcc, protocol, governance)

  protocol.set(CONTANGO_CAULDRON, contangoCauldron.address)
  writeAddressMap('protocol.json', protocol)
})()

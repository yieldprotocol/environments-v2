import { writeAddressMap, getOwnerOrImpersonate } from '../../../shared/helpers'

import { deployCauldron } from '../../fragments/core/deployCauldron'
const { protocol, governance } = require(process.env.CONF as string)
const { developer } = require(process.env.CONF as string)

/**
 * @dev This script deploys the Cauldron
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)

  const cauldron = await deployCauldron(ownerAcc, protocol, governance)
  protocol.set('cauldron', cauldron.address)

  writeAddressMap('protocol.json', protocol)
})()

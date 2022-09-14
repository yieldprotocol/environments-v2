import { ethers, waffle } from 'hardhat'
import { writeAddressMap } from '../../../../../shared/helpers'

const { protocol, governance } = require(process.env.CONF as string)

import { deployNotionalJoinFactory } from '../../../../fragments/core/deployNotionalJoinFactory'

/**
 * @dev This script deploys the NotionalJoinFactory
 */
;(async () => {
  const notionalJoinFactory = await deployNotionalJoinFactory()
  protocol.set('notionalJoinFactory', notionalJoinFactory.address)

  writeAddressMap('protocol.json', protocol)

  console.log(`completed`)
})()

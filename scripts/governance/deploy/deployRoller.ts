import { ethers } from 'hardhat'
import { writeAddressMap, getOwnerOrImpersonate } from '../../../shared/helpers'

import { deployRoller } from '../../fragments/utils/deployRoller'
const { protocol, governance } = require(process.env.CONF as string)
const { developer } = require(process.env.CONF as string)

import { Timelock } from '../../../typechain'

/**
 * @dev This script deploys the Cauldron
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  const roller = await deployRoller(ownerAcc, protocol, timelock)
  protocol.set('roller', roller.address)

  writeAddressMap('protocol.json', protocol)
})()

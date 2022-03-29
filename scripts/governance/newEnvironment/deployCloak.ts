import { ethers } from 'hardhat'
import {
  writeAddressMap,
  getOwnerOrImpersonate,
} from '../../../shared/helpers'

import { deployCloak } from '../../fragments/core/governance/deployCloak'
import { Timelock } from '../../../typechain'
const { protocol, governance } = require(process.env.CONF as string)
const { developer } = require(process.env.CONF as string)

/**
 * @dev This script deploys the Cloak
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  const cloak = await deployCloak(ownerAcc, timelock, governance)
  protocol.set('cloak', cloak.address)

  writeAddressMap('protocol.json', protocol)
})()

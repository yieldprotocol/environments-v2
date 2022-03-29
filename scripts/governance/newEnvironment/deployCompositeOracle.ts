import { ethers } from 'hardhat'
import {
  writeAddressMap,
  getOwnerOrImpersonate,
} from '../../../shared/helpers'

import { deployCompositeOracle } from '../../fragments/oracles/deployCompositeOracle'

import { Timelock } from '../../../typechain'
const { protocol, governance } = require(process.env.CONF as string)
const { developer } = require(process.env.CONF as string)

/**
 * @dev This script deploys the Composite Oracle
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  const compositeOracle = await deployCompositeOracle(ownerAcc, timelock, protocol)
  protocol.set('compositeOracle', compositeOracle.address)

  writeAddressMap('protocol.json', protocol)
})()

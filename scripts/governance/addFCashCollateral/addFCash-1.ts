import { ethers } from 'hardhat'
import { writeAddressMap, getOwnerOrImpersonate } from '../../../shared/helpers'

import { deployNotionalOracle } from '../../fragments/oracles/deployNotionalOracle'

import { Timelock } from '../../../typechain'
const { developer } = require(process.env.CONF as string)
const { governance, protocol } = require(process.env.CONF as string)

/**
 * @dev This script deploys the Notional Oracle
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  const notionalOracle = await deployNotionalOracle(ownerAcc, timelock, protocol)
  protocol.set('notionalOracle', notionalOracle.address)

  writeAddressMap('protocol.json', protocol)
})()

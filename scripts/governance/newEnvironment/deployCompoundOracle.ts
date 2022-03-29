import { ethers } from 'hardhat'
import {
  writeAddressMap,
  getOwnerOrImpersonate,
} from '../../../shared/helpers'

import { deployCompoundOracle } from '../../fragments/oracles/deployCompoundOracle'

import { Timelock } from '../../../typechain'
const { protocol, governance } = require(process.env.CONF as string)
const { developer } = require(process.env.CONF as string)

/**
 * @dev This script deploys the Compound Oracle
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  const compoundOracle = await deployCompoundOracle(ownerAcc, timelock, protocol)
  protocol.set('compoundOracle', compoundOracle.address)

  writeAddressMap('protocol.json', protocol)
})()

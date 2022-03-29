import { ethers } from 'hardhat'
import {
  writeAddressMap,
  getOwnerOrImpersonate,
} from '../../../shared/helpers'

import { deployYearnOracle } from '../../fragments/oracles/deployYearnOracle'

import { Timelock } from '../../../typechain'
const { protocol, governance } = require(process.env.CONF as string)
const { developer } = require(process.env.CONF as string)

/**
 * @dev This script deploys the YearnVault Oracle
 */

;(async () => {

  let ownerAcc = await getOwnerOrImpersonate(developer as string)

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  const yearnOracle = await deployYearnOracle(ownerAcc, timelock, protocol)
  protocol.set('yearnOracle', yearnOracle.address)

  writeAddressMap('protocol.json', protocol)
})()

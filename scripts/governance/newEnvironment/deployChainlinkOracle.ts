import { ethers } from 'hardhat'
import {
  writeAddressMap,
  getOwnerOrImpersonate,
} from '../../../shared/helpers'

import { deployChainlinkOracle } from '../../fragments/oracles/deployChainlinkOracle'

import { Timelock } from '../../../typechain'
const { protocol, governance } = require(process.env.CONF as string)
const { developer } = require(process.env.CONF as string)

/**
 * @dev This script deploys the Chainlink Oracle
 */

;(async () => {

  let ownerAcc = await getOwnerOrImpersonate(developer as string)

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  const chainlinkOracle = await deployChainlinkOracle(ownerAcc, timelock, protocol)
  protocol.set('chainlinkOracle', chainlinkOracle.address)

  writeAddressMap('protocol.json', protocol)
})()

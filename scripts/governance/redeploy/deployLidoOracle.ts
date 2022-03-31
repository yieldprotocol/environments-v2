import { ethers } from 'hardhat'
import { writeAddressMap, getOwnerOrImpersonate } from '../../../shared/helpers'

import { deployLidoOracle } from '../../fragments/oracles/deployLidoOracle'

import { Timelock } from '../../../typechain'
const { protocol, governance } = require(process.env.CONF as string)
const { developer } = require(process.env.CONF as string)

/**
 * @dev This script deploys the Lido Oracle
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  const lidoOracle = await deployLidoOracle(ownerAcc, timelock, protocol)
  protocol.set('lidoOracle', lidoOracle.address)

  writeAddressMap('protocol.json', protocol)
})()

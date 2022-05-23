import { ethers } from 'hardhat'
import { writeAddressMap, getOwnerOrImpersonate } from '../../../../../shared/helpers'

import { deployTWAROracle } from '../../../../fragments/oracles/deployTWAROracle'

import { Timelock } from '../../../../../typechain'
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

  const twarOracle = await deployTWAROracle(ownerAcc, timelock, protocol)
  protocol.set('twarOracle', twarOracle.address)

  writeAddressMap('protocol.json', protocol)
})()

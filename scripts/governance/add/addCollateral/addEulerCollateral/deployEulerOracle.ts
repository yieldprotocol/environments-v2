import { ethers } from 'hardhat'
import { writeAddressMap, getOwnerOrImpersonate } from '../../../../../shared/helpers'

import { deployEulerOracle } from '../../../../fragments/oracles/deployEulerOracle'

import { Timelock } from '../../../../../typechain'
import { EULER } from '../../../../../shared/constants'
const { developer } = require(process.env.CONF as string)
const { governance, protocol } = require(process.env.CONF as string)

/**
 * @dev This script deploys the Euler Oracle
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  const eulerOracle = await deployEulerOracle(ownerAcc, timelock, protocol)
  protocol.set(EULER, eulerOracle.address)

  writeAddressMap('protocol.json', protocol)
})()

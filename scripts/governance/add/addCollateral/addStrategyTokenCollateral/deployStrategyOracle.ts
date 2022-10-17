import { ethers } from 'hardhat'
import { writeAddressMap, getOwnerOrImpersonate } from '../../../../../shared/helpers'

import { deployStrategyOracle } from '../../../../fragments/oracles/deployStrategyOracle'

import { Timelock } from '../../../../../typechain'
const { protocol, governance } = require(process.env.CONF as string)
const { developer } = require(process.env.CONF as string)

/**
 * @dev This script deploys the Lido Oracle
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)

  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc)

  const strategyOracle = await deployStrategyOracle(ownerAcc, timelock, protocol)
  protocol.set('strategyOracle', strategyOracle.address)

  writeAddressMap('protocol.json', protocol)
})()

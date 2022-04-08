import { ethers } from 'hardhat'
import { writeAddressMap, getOwnerOrImpersonate } from '../../../../shared/helpers'

import { deployAccumulatorOracle } from '../../../fragments/oracles/deployAccumulatorOracle'

const { developer, governance, protocol } = require(process.env.CONF as string)

/**
 * @dev This script deploys the Ladle
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)

  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc)

  const accumulatorOracle = await deployAccumulatorOracle(ownerAcc, timelock, protocol)
  protocol.set('accumulatorOracle', accumulatorOracle.address)

  writeAddressMap('protocol.json', protocol)
})()

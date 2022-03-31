import { ethers } from 'hardhat'
import {
  readAddressMappingIfExists,
  writeAddressMap,
  getOwnerOrImpersonate,
  getOriginalChainId,
} from '../../../../shared/helpers'

import { deployAccumulatorOracle } from '../../../fragments/oracles/deployAccumulatorOracle'

import { Timelock } from '../../../../typechain'
const { developer } = require(process.env.CONF as string)

/**
 * @dev This script deploys the Ladle
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  const accumulatorOracle = await deployAccumulatorOracle(ownerAcc, timelock, protocol)
  protocol.set('accumulatorOracle', accumulatorOracle.address)

  writeAddressMap('protocol.json', protocol)
})()

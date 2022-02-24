import { ethers } from 'hardhat'
import {
  readAddressMappingIfExists,
  writeAddressMap,
  getOwnerOrImpersonate,
  getOriginalChainId,
} from '../../../shared/helpers'

import { deployNotionalOracle } from '../../fragments/oracles/deployNotionalOracle'

import { Timelock } from '../../../typechain'
const { developer } = require(process.env.CONF as string)

/**
 * @dev This script deploys the Notional Oracle
 */

;(async () => {
  const chainId = await getOriginalChainId()

  let ownerAcc = await getOwnerOrImpersonate(developer as string)
  const protocol = readAddressMappingIfExists('protocol.json')
  const governance = readAddressMappingIfExists('governance.json')

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  const notionalOracle = await deployNotionalOracle(ownerAcc, timelock, protocol)
  protocol.set('notionalOracle', notionalOracle.address)

  writeAddressMap('protocol.json', protocol)
})()

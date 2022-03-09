import { ethers } from 'hardhat'
import {
  readAddressMappingIfExists,
  writeAddressMap,
  getOwnerOrImpersonate,
  getOriginalChainId,
} from '../../../shared/helpers'

import { deployYearnOracle } from '../../fragments/oracles/deployYearnOracle'

import { Timelock } from '../../../typechain'
const { developer } = require(process.env.CONF as string)

/**
 * @dev This script deploys the YearnVault Oracle
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

  const yearnOracle = await deployYearnOracle(ownerAcc, timelock, protocol)
  protocol.set('yearnOracle', yearnOracle.address)

  writeAddressMap('protocol.json', protocol)
})()

import { ethers } from 'hardhat'
import {
  readAddressMappingIfExists,
  writeAddressMap,
  getOwnerOrImpersonate,
  getOriginalChainId,
} from '../../../shared/helpers'

import { deployTransfer1155Module } from '../../fragments/modules/deployTransfer1155Module'

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

  const transfer1155Module = await deployTransfer1155Module(ownerAcc, timelock, protocol)
  protocol.set('transfer1155Module', transfer1155Module.address)

  writeAddressMap('protocol.json', protocol)
})()

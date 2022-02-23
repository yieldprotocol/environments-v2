import { ethers } from 'hardhat'
import {
  readAddressMappingIfExists,
  writeAddressMap,
  getOwnerOrImpersonate,
} from '../../../shared/helpers'

import { deployTransfer1155Module } from '../../fragments/modules/deployTransfer1155Module'

import { Cauldron, WETH9Mock } from '../../../typechain'
import { ETH } from '../../../shared/constants'
const { developer, assets } = require(process.env.CONF as string)

/**
 * @dev This script deploys the YearnVault Oracle
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)
  const protocol = readAddressMappingIfExists('protocol.json')

  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron

  const weth = (await ethers.getContractAt(
    'WETH9Mock',
    assets.get(ETH) as string,
    ownerAcc
  )) as unknown as WETH9Mock

  const transfer1155Module = await deployTransfer1155Module(ownerAcc, cauldron, weth, protocol)
  protocol.set('transfer1155Module', transfer1155Module.address)

  writeAddressMap('protocol.json', protocol)
})()

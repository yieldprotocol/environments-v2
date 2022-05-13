import { ethers } from 'hardhat'
import { writeAddressMap, getOwnerOrImpersonate } from '../../../shared/helpers'
import { ETH } from '../../../shared/constants'

import { deployLadle } from '../../fragments/core/deployLadle'

import { WETH9Mock } from '../../../typechain'
const { protocol, governance } = require(process.env.CONF as string)
const { developer, assets } = require(process.env.CONF as string)

/**
 * @dev This script deploys the Ladle
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)

  const weth9 = (await ethers.getContractAt(
    'WETH9Mock',
    (assets as Map<string, string>).get(ETH) as string,
    ownerAcc
  )) as unknown as WETH9Mock

  const ladle = await deployLadle(ownerAcc, weth9, protocol, governance)
  protocol.set('ladle', ladle.address)

  const router = await ladle.router()
  protocol.set('router', router)

  writeAddressMap('protocol.json', protocol)
})()

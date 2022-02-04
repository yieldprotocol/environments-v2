import { ethers } from 'hardhat'
import { readAddressMappingIfExists, writeAddressMap, getOwnerOrImpersonate, getOriginalChainId } from '../../../shared/helpers'
import { ETH } from '../../../shared/constants'

import { deployLadle } from '../../fragments/core/deployLadle'

import { WETH9Mock } from '../../../typechain'
const { developer, assets } = require(process.env.CONF as string)

/**
 * @dev This script deploys the Ladle
 */

;(async () => {
  const chainId = await getOriginalChainId()

  let ownerAcc = await getOwnerOrImpersonate(developer as string)
  const protocol = readAddressMappingIfExists('protocol.json');
  const governance = readAddressMappingIfExists('governance.json');

  const weth9 = (await ethers.getContractAt(
    'WETH9Mock',
    (assets as Map<string,string>).get(ETH) as string,
    ownerAcc
  )) as unknown as WETH9Mock

  const ladle = await deployLadle(ownerAcc, weth9, protocol, governance)
  protocol.set('ladle', ladle.address)

  const router = await ladle.router()
  protocol.set('router', router)

  writeAddressMap('protocol.json', protocol);
})()

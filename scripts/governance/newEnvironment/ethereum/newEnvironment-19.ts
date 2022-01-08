import { ethers } from 'hardhat'
import { readAddressMappingIfExists, writeAddressMap, getOwnerOrImpersonate, getOriginalChainId } from '../../../../shared/helpers'
import { ETH } from '../../../../shared/constants'

import { deployLadle } from '../../../fragments/core/deployLadle'

import { WETH9Mock } from '../../../../typechain'
import { developer, assets } from './newEnvironment.config'

/**
 * @dev This script orchestrates the Factories
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (!(chainId === 1 || chainId === 4 || chainId === 42)) throw 'Only Rinkeby, Kovan and Mainnet supported'

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string)
  const protocol = readAddressMappingIfExists('protocol.json');
  const governance = readAddressMappingIfExists('governance.json');

  const weth9 = (await ethers.getContractAt(
    'WETH9Mock',
    (assets.get(chainId) as Map<string,string>).get(ETH) as string,
    ownerAcc
  )) as unknown as WETH9Mock

  const ladle = await deployLadle(ownerAcc, weth9, protocol, governance)
  protocol.set('ladle', ladle.address)

  const router = await ladle.router()
  protocol.set('router', router)

  writeAddressMap('protocol.json', protocol);
})()
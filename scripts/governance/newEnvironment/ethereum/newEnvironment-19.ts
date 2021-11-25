import { ethers } from 'hardhat'
import { readAddressMappingIfExists, writeAddressMap, getOwnerOrImpersonate, getOriginalChainId } from '../../../../shared/helpers'
import { ETH } from '../../../../shared/constants'

import { deployLadle } from '../../../fragments/core/deployLadle'

import { WETH9Mock, Timelock, Cauldron } from '../../../../typechain'
import { developer, assets } from './newEnvironment.config'

/**
 * @dev This script orchestrates the Factories
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (chainId !== 1 && chainId !== 42) throw 'Only Kovan and Mainnet supported'

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string)
  const governance = readAddressMappingIfExists('governance.json');
  const protocol = readAddressMappingIfExists('protocol.json');

  const weth9 = (await ethers.getContractAt(
    'WETH9Mock',
    assets.get(chainId).get(ETH) as string,
    ownerAcc
  )) as unknown as WETH9Mock
  
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  const cauldron = ((await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown) as Cauldron

  const ladle = await deployLadle(ownerAcc, weth9, timelock, cauldron)
  protocol.set('ladle', ladle.address)
  writeAddressMap('protocol.json', protocol);
})()

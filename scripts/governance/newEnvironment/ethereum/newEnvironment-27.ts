import { ethers } from 'hardhat'
import { readAddressMappingIfExists, getOwnerOrImpersonate, getOriginalChainId, writeAddressMap } from '../../../../shared/helpers'

import { deployStrategies } from '../../../fragments/core/strategies/deployStrategies'
import { Cauldron, Ladle, SafeERC20Namer, YieldMathExtensions, Timelock } from '../../../../typechain'
import { developer, strategiesData } from './newEnvironment.config'

/**
 * @dev This script deploys strategies
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (!(chainId === 1 || chainId === 4 || chainId === 42)) throw 'Only Rinkeby, Kovan and Mainnet supported'

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string)
  const governance = readAddressMappingIfExists('governance.json');
  const protocol = readAddressMappingIfExists('protocol.json');
  const existingStrategies = readAddressMappingIfExists('strategies.json');

  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron
  const ladle = (await ethers.getContractAt(
    'Ladle',
    protocol.get('ladle') as string,
    ownerAcc
  )) as unknown as Ladle
  const safeERC20Namer = (await ethers.getContractAt(
    'SafeERC20Namer',
    protocol.get('safeERC20Namer') as string,
    ownerAcc
  )) as unknown as SafeERC20Namer
  const yieldMathExtensions = (await ethers.getContractAt(
    'YieldMathExtensions',
    protocol.get('yieldMathExtensions') as string,
    ownerAcc
  )) as unknown as YieldMathExtensions
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  const deployedStrategies = await deployStrategies(ownerAcc, existingStrategies, cauldron, ladle, safeERC20Namer, yieldMathExtensions, timelock, strategiesData)
  writeAddressMap('strategies.json', deployedStrategies);
})()

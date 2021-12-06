import { ethers } from 'hardhat'
import { readAddressMappingIfExists, writeAddressMap, getOwnerOrImpersonate, getOriginalChainId } from '../../../shared/helpers'

import { deployStrategies } from '../../fragments/core/strategies/deployStrategies'
import { Cauldron, Ladle, SafeERC20Namer, YieldMathExtensions, Timelock } from '../../../typechain'
import { developer, newStrategies } from './addEthSeries.config'

/**
 * @dev This script deploys two strategies to be used for Ether
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (!(chainId === 1 || chainId === 4 || chainId === 42)) throw "Only Kovan, Rinkeby and Mainnet supported"

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string)

  const protocol = readAddressMappingIfExists('protocol.json');
  const governance = readAddressMappingIfExists('governance.json');
  let strategies = readAddressMappingIfExists('strategies.json');

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

  strategies = await deployStrategies(ownerAcc, strategies, cauldron, ladle, safeERC20Namer, yieldMathExtensions, timelock, newStrategies)
  writeAddressMap('strategies.json', strategies)
})()

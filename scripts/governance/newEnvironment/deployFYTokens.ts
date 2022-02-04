import { ethers } from 'hardhat'
import { readAddressMappingIfExists, writeAddressMap, getOwnerOrImpersonate, getOriginalChainId } from '../../../shared/helpers'

import { deployFYTokens } from '../../fragments/assetsAndSeries/deployFYTokens'
import { SafeERC20Namer, Timelock } from '../../../typechain'
const { developer, fyTokenData } = require(process.env.CONF as string)

/**
 * @dev This script deploys two strategies to be used for Ether
 */

;(async () => {
  const chainId = await getOriginalChainId()

  let ownerAcc = await getOwnerOrImpersonate(developer)

  const protocol = readAddressMappingIfExists('protocol.json');
  const governance = readAddressMappingIfExists('governance.json');

  const safeERC20Namer = (await ethers.getContractAt(
    'SafeERC20Namer',
    protocol.get('safeERC20Namer') as string,
    ownerAcc
  )) as unknown as SafeERC20Namer
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  const fyTokens = await deployFYTokens(ownerAcc, timelock, safeERC20Namer, fyTokenData)
  writeAddressMap('fyTokens.json', fyTokens) // fyTokens.json is a temporary file
})()

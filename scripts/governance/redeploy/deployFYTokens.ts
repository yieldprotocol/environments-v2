import { ethers } from 'hardhat'
import { writeAddressMap, getOwnerOrImpersonate } from '../../../shared/helpers'

import { deployFYTokens } from '../../fragments/assetsAndSeries/deployFYTokens'
import { SafeERC20Namer, Timelock } from '../../../typechain'
const { protocol, governance } = require(process.env.CONF as string)
const { developer, fyTokenData } = require(process.env.CONF as string)

/**
 * @dev This script deploys two strategies to be used for Ether
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

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

  const newFYTokens = await deployFYTokens(ownerAcc, timelock, safeERC20Namer, fyTokenData)
  writeAddressMap('newFYTokens.json', newFYTokens) // newFYTokens.json is a temporary file
})()

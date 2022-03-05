import { ethers } from 'hardhat'
import {
  writeAddressMap,
  getOwnerOrImpersonate,
} from '../../../shared/helpers'

import { deployJoins1155 } from '../../fragments/assetsAndSeries/deployJoins1155'

import { Timelock } from '../../../typechain'
const { developer, assetsToAdd } = require(process.env.CONF as string)
const { governance } = require(process.env.CONF as string)

/**
 * @dev This script deploys a Join
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  const newJoins = await deployJoins1155(ownerAcc, timelock, assetsToAdd)
  writeAddressMap('newJoins.json', newJoins) // newJoins.json is a tempporary file
})()

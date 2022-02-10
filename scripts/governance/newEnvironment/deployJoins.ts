import { ethers } from 'hardhat'
import {
  readAddressMappingIfExists,
  writeAddressMap,
  getOwnerOrImpersonate,
  getOriginalChainId,
} from '../../../shared/helpers'

import { deployJoins } from '../../fragments/assetsAndSeries/deployJoins'

import { Timelock } from '../../../typechain'
const { developer, assetsToAdd } = require(process.env.CONF as string)

/**
 * @dev This script deploys a Join
 */

;(async () => {
  const chainId = await getOriginalChainId()

  let ownerAcc = await getOwnerOrImpersonate(developer)
  const governance = readAddressMappingIfExists('governance.json')

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  const joins = await deployJoins(ownerAcc, timelock, assetsToAdd)
  writeAddressMap('joins.json', joins) // joins.json is a tempporary file
})()

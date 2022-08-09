import { ethers } from 'hardhat'
import {
  readAddressMappingIfExists,
  writeAddressMap,
  getOwnerOrImpersonate,
  getOriginalChainId,
} from '../../../../../shared/helpers'

import { deployJoins } from '../../../../fragments/assetsAndSeries/deployJoins'

import { developer, assetsToAdd } from './addMKR.rinkeby.config'

/**
 * @dev This script deploys a Join
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)
  const governance = readAddressMappingIfExists('governance.json')

  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock'), ownerAcc)

  const joins = await deployJoins(ownerAcc, timelock, assetsToAdd)
  writeAddressMap('joins.json', joins) // joins.json is a tempporary file
})()

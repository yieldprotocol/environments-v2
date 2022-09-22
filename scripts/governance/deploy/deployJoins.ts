import { ethers } from 'hardhat'
import { writeAddressMap, getOwnerOrImpersonate } from '../../../shared/helpers'
import { deployJoins } from '../../fragments/assetsAndSeries/deployJoins'

const { governance, protocol, developer, assetsToAdd } = require(process.env.CONF as string)

/**
 * @dev This script deploys a Join
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc)
  const ladle = await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)

  const newJoins = await deployJoins(ownerAcc, timelock, ladle, assetsToAdd)
  writeAddressMap('newJoins.json', newJoins) // newJoins.json is a temporary file
})()

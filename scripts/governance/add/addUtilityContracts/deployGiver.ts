import { ethers, waffle } from 'hardhat'
import {
  getOriginalChainId,
  getOwnerOrImpersonate,
  readAddressMappingIfExists,
  writeAddressMap,
  verify,
} from '../../../../shared/helpers'

import GiverArtifact from '../../../../artifacts/@yield-protocol/vault-v2/contracts/utils/Giver.sol/Giver.json'
import { Giver } from '../../../../typechain'
import { ROOT } from '../../../../shared/constants'
const { developer,deployer } = require(process.env.CONF as string)
const { protocol,governance } = require(process.env.CONF as string)
const { deployContract } = waffle

/**
 * @dev This script deploys the Giver
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(deployer)

  const cauldron = protocol.get('cauldron') as string
  const timelock = governance.get('timelock') as string
  let giver: Giver
  if (protocol.get('giver') === undefined) {
    giver = (await deployContract(ownerAcc, GiverArtifact, [cauldron])) as Giver
    console.log(`Giver deployed at ${giver.address}`)
    verify(giver.address, [cauldron])
    protocol.set('giver', giver.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    giver = (await ethers.getContractAt('Giver', protocol.get('giver') as string, ownerAcc)) as unknown as Giver
    console.log(`Reusing Giver at ${giver.address}`)
  }

  if (!(await giver.hasRole(ROOT, timelock))) {
    await giver.grantRole(ROOT, timelock)
    console.log(`giver.grantRoles(ROOT, timelock)`)
    while (!(await giver.hasRole(ROOT, timelock))) {}
  }
  
  if (!(await giver.hasRole(ROOT, deployer))) {
    await giver.revokeRole(ROOT, deployer)
    console.log(`giver.revokeRole(ROOT, deployer)`)
    while (!(await giver.hasRole(ROOT, deployer))) {}
  }
  return giver
})()

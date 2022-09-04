import { ethers, waffle } from 'hardhat'
import { getOwnerOrImpersonate, writeAddressMap, verify } from '../../../../../shared/helpers'

import NotionalJoinFactoryArtifact from '../../../../../artifacts/contracts/NotionalJoinFactory.sol/NotionalJoinFactory.json'
import { NotionalJoinFactory } from '../../../../../typechain'
import { ROOT } from '../../../../../shared/constants'
const { developer, deployer } = require(process.env.CONF as string)
const { protocol, governance } = require(process.env.CONF as string)
const { deployContract } = waffle

/**
 * @dev This script deploys the NotionalJoinFactory
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(deployer)
  const cloak = governance.get('cloak') as string
  const timelock = governance.get('timelock') as string
  const ladle = protocol.get('ladle') as string

  let notionalJoinFactory: NotionalJoinFactory
  let args = [cloak, timelock, ladle]
  console.log(`cloak: ${cloak}`)
  console.log(`timelock: ${timelock}`)
  console.log(`ladle: ${ladle}`)

  if (protocol.get('notionalJoinFactory') === undefined) {
    notionalJoinFactory = (await deployContract(ownerAcc, NotionalJoinFactoryArtifact, args)) as NotionalJoinFactory
    console.log(`NotionalJoinFactory deployed at ${notionalJoinFactory.address}`)
    verify(notionalJoinFactory.address, args)
    protocol.set('NotionalJoinFactory', notionalJoinFactory.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    notionalJoinFactory = (await ethers.getContractAt(
      'NotionalJoinFactory',
      protocol.get('NotionalJoinFactory') as string,
      ownerAcc
    )) as unknown as NotionalJoinFactory
    console.log(`Reusing NotionalJoinFactory at ${notionalJoinFactory.address}`)
  }

  if (!(await notionalJoinFactory.hasRole(ROOT, timelock))) {
    await notionalJoinFactory.grantRole(ROOT, timelock)
    console.log(`notionalJoinFactory.grantRoles(ROOT, timelock)`)
    while (!(await notionalJoinFactory.hasRole(ROOT, timelock))) {}
  }

  if (!(await notionalJoinFactory.hasRole(ROOT, deployer))) {
    await notionalJoinFactory.revokeRole(ROOT, deployer)
    console.log(`notionalJoinFactory.revokeRole(ROOT, deployer)`)
    while (!(await notionalJoinFactory.hasRole(ROOT, deployer))) {}
  }

  console.log(`completed`)

  return notionalJoinFactory
})()

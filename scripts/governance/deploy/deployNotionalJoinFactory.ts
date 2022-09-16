import { ethers, waffle } from 'hardhat'
import { getOwnerOrImpersonate, writeAddressMap, verify } from '../../../shared/helpers'

import NotionalJoinFactoryArtifact from '../../../artifacts/contracts/NotionalJoinFactory.sol/NotionalJoinFactory.json'
import { NotionalJoinFactory } from '../../../typechain'
import { ROOT } from '../../../shared/constants'
import { id } from '@yield-protocol/utils-v2'

const { developer, deployer } = require(process.env.CONF as string)
const { protocol, governance } = require(process.env.CONF as string)
const { deployContract } = waffle

/**
 * @dev This script deploys the NotionalJoinFactory
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(deployer)
  const cloak = governance.get('cloak')
  const timelock = governance.get('timelock')
  const ladle = protocol.get('ladle')

  let notionalJoinFactory: NotionalJoinFactory
  let args = [cloak, timelock, ladle]
  console.log(`cloak: ${cloak}`)
  console.log(`timelock: ${timelock}`)
  console.log(`ladle: ${ladle}`)

  if (protocol.get('notionalJoinFactory') === undefined) {
    notionalJoinFactory = (await deployContract(ownerAcc, NotionalJoinFactoryArtifact, args)) as NotionalJoinFactory
    console.log(`NotionalJoinFactory deployed at ${notionalJoinFactory.address}`)
    verify(notionalJoinFactory.address, args)
    protocol.set('notionalJoinFactory', notionalJoinFactory.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    notionalJoinFactory = await ethers.getContractAt(
      'NotionalJoinFactory',
      protocol.get('notionalJoinFactory') as string,
      ownerAcc
    )
    console.log(`Reusing NotionalJoinFactory at ${notionalJoinFactory.address}`)
  }

  // timelock
  if (!(await notionalJoinFactory.hasRole(ROOT, timelock))) {
    await notionalJoinFactory.grantRoles(
      [
        id(notionalJoinFactory.interface, 'deploy(bytes6,bytes6,address,uint256)'),
        id(notionalJoinFactory.interface, 'point(bytes32,address)'),
        ROOT,
      ],
      timelock
    )
    console.log(`notionalJoinFactory.grantRoles(ROOT, timelock)`)
    await notionalJoinFactory.hasRole(ROOT, timelock)
  } else {
    console.log(`timelock has ROOT`)
  }

  // cloak
  if (!(await notionalJoinFactory.hasRole(ROOT, cloak))) {
    await notionalJoinFactory.grantRole(ROOT, cloak)
    console.log(`notionalJoinFactory.grantRoles(ROOT, cloak)`)
    await notionalJoinFactory.hasRole(ROOT, cloak)
  } else {
    console.log(`cloak has ROOT`)
  }

  // deployer
  if (!(await notionalJoinFactory.hasRole(ROOT, deployer))) {
    console.log(`deployer ROOT revoked`)
  } else {
    await notionalJoinFactory.revokeRole(ROOT, deployer)
    console.log(`notionalJoinFactory.revokeRole(ROOT, deployer)`)
    const hasRoot = await notionalJoinFactory.hasRole(ROOT, deployer)
    console.log('deployer has root:', hasRoot)
  }

  console.log(`completed`)

  return notionalJoinFactory
})()

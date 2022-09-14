import { ethers, waffle } from 'hardhat'
import { getOwnerOrImpersonate, verify } from '../../../shared/helpers'
import { ROOT } from '../../../shared/constants'

import NotionalJoinFactoryArtifact from '../../../artifacts/contracts/NotionalJoinFactory.sol/NotionalJoinFactory.json'
import { NotionalJoinFactory } from '../../../typechain'

const { protocol, governance } = require(process.env.CONF as string)
const { developer, deployer } = require(process.env.CONF as string)
const { deployContract } = waffle

/**
 * @dev This script deploys the NotionalJoinFactory and orchestrates permissions.
 */

export const deployNotionalJoinFactory = async (): Promise<NotionalJoinFactory> => {
  let ownerAcc = await getOwnerOrImpersonate(deployer)

  const cloak = governance.get('cloak')
  console.log(`cloak: ${cloak}`)

  const timelock = governance.get('timelock')
  console.log(`timelock: ${timelock}`)

  const ladle = protocol.get('ladle')
  console.log(`ladle: ${ladle}`)

  let notionalJoinFactory: NotionalJoinFactory
  let args = [cloak, timelock, ladle]

  if (protocol.get('notionalJoinFactory') === undefined) {
    notionalJoinFactory = (await deployContract(ownerAcc, NotionalJoinFactoryArtifact, args)) as NotionalJoinFactory
    console.log(`NotionalJoinFactory deployed at ${notionalJoinFactory.address}`)
    verify(notionalJoinFactory.address, args)
  } else {
    notionalJoinFactory = await ethers.getContractAt(
      'NotionalJoinFactory',
      protocol.get('notionalJoinFactory') as string,
      ownerAcc
    )
    console.log(`Reusing NotionalJoinFactory at ${notionalJoinFactory.address}`)
  }

  if (!(await notionalJoinFactory.hasRole(ROOT, timelock))) {
    await notionalJoinFactory.grantRole(ROOT, timelock)
    console.log(`notionalJoinFactory.grantRoles(ROOT, timelock)`)
    await notionalJoinFactory.hasRole(ROOT, timelock)
  } else {
    console.log(`timelock has ROOT`)
  }

  return notionalJoinFactory
}

import { id } from '@yield-protocol/utils-v2'
import { ethers, waffle } from 'hardhat'
import { getOwnerOrImpersonate, verify } from '../../../shared/helpers'
import { ROOT } from '../../../shared/constants'

import { NotionalJoinFactory, EmergencyBrake, Timelock } from '../../../typechain'

const { protocol, governance } = require(process.env.CONF as string)
const { developer, deployer } = require(process.env.CONF as string)
const { deployContract } = waffle

/**
 * @dev This script orchestrates the NotionalJoinFactory
 * The Cloak gets ROOT access.
 * Root access is removed from the deployer.
 * The Timelock gets access to governance functions.
 * The Ladle gets access to the permissioned functions in Cauldron
 * Emergency plans are registered
 */
export const orchestrateNotionalJoinFactoryProposal = async (
  ownerAcc: any,
  deployer: string,
  cloak: EmergencyBrake,
  timelock: Timelock
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []

  const notionalJoinFactory = (await ethers.getContractAt(
    'NotionalJoinFactory',
    protocol.get('notionalJoinFactory') as string,
    ownerAcc
  )) as NotionalJoinFactory
  console.log(`notionalJoinFactory: ${notionalJoinFactory.address}`)

  proposal.push({
    target: notionalJoinFactory.address,
    data: notionalJoinFactory.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
  })
  console.log(`notionalJoinFactory.grantRole(ROOT, cloak)`)

  proposal.push({
    target: notionalJoinFactory.address,
    data: notionalJoinFactory.interface.encodeFunctionData('revokeRole', [ROOT, deployer]),
  })
  console.log(`notionalJoinFactory.revokeRole(ROOT, deployer)`)

  // new
  proposal.push({
    target: notionalJoinFactory.address,
    data: notionalJoinFactory.interface.encodeFunctionData('grantRoles', [
      [
        id(notionalJoinFactory.interface, 'addFCash(bytes6,uint256)'),
        id(notionalJoinFactory.interface, 'deploy(bytes6,bytes6,address,uint256)'),
        id(notionalJoinFactory.interface, 'getByteCode(address,address,address,uint40,uint16)'),
        id(notionalJoinFactory.interface, 'getAddress(bytes,uint256)'),
      ],
      deployer,
    ]),
  })
  console.log(`notionalJoinFactory.grantRoles(deployer)`)

  return proposal
}

//   proposal.push({
//     target: notionalJoinFactory.address,
//     data: notionalJoinFactory.interface.encodeFunctionData('grantRole', [
//       id(notionalJoinFactory.interface, 'addFCash(bytes6,uint256)'),
//       deployer,
//     ]),
//   })

//   proposal.push({
//     target: notionalJoinFactory.address,
//     data: notionalJoinFactory.interface.encodeFunctionData('grantRole', [
//       id(notionalJoinFactory.interface, 'deploy(bytes6,bytes6,address,uint256)'),
//       deployer,
//     ]),
//   })

//   proposal.push({
//     target: notionalJoinFactory.address,
//     data: notionalJoinFactory.interface.encodeFunctionData('grantRole', [
//       id(notionalJoinFactory.interface, 'getByteCode(address,address,address,uint40,uint16)'),
//       deployer,
//     ]),
//   })

//   proposal.push({
//     target: notionalJoinFactory.address,
//     data: notionalJoinFactory.interface.encodeFunctionData('grantRole', [
//       id(notionalJoinFactory.interface, 'getAddress(bytes,uint256)'),
//       deployer,
//     ]),
//   })

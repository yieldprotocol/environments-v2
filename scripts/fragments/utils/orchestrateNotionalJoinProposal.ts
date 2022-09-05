import { ethers } from 'hardhat'
import { id } from '@yield-protocol/utils-v2'
import { ROOT } from '../../../shared/constants'
import { bytesToString } from '../../../shared/helpers'

import { Timelock, NotionalJoinFactory } from '../../../typechain'

const { protocol, governance } = require(process.env.CONF as string)
export const orchestrateNotionalJoinProposal = async (
  ownerAcc: any,
  deployer: string,
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
    data: notionalJoinFactory.interface.encodeFunctionData('grantRole', [
      id(notionalJoinFactory.interface, 'addFCash(bytes6,uint256)'),
      deployer,
    ]),
  })

  proposal.push({
    target: notionalJoinFactory.address,
    data: notionalJoinFactory.interface.encodeFunctionData('grantRole', [
      id(notionalJoinFactory.interface, 'deploy(bytes6,bytes6,address,uint256)'),
      deployer,
    ]),
  })

  proposal.push({
    target: notionalJoinFactory.address,
    data: notionalJoinFactory.interface.encodeFunctionData('grantRole', [
      id(notionalJoinFactory.interface, 'getByteCode(address,address,address,uint40,uint16)'),
      deployer,
    ]),
  })

  proposal.push({
    target: notionalJoinFactory.address,
    data: notionalJoinFactory.interface.encodeFunctionData('grantRole', [
      id(notionalJoinFactory.interface, 'getAddress(bytes,uint256)'),
      deployer,
    ]),
  })

  return proposal
}

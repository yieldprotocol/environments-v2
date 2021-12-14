import { ethers, waffle } from 'hardhat'
import { verify } from '../../../shared/helpers'
import { ROOT } from '../../../shared/constants'

import JoinArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/Join.sol/Join.json'

import { ERC20Mock, Timelock, Join } from '../../../typechain'

const { deployContract } = waffle

/**
 * @dev This script deploys a Join
 * The account to operate with needs to be passed as a parameter, as well as the asset address to use.
 * The protocol and governance mappings are passed as parameters. In the future probably a context object will be passed instead.
 */

export const deployJoin = async (
    ownerAcc: any,
    asset: ERC20Mock,
    protocol: Map<string, string>,
    governance: Map<string, string>,
  ): Promise<Join> => {
  console.log(`Using ${await asset.name()} at ${asset.address}`)

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  let join: Join
  join = (await deployContract(ownerAcc, JoinArtifact, [asset.address])) as Join
  console.log(`Join deployed at ${join.address}`)
  verify(join.address, [asset.address])

  if (!(await join.hasRole(ROOT, timelock.address))) {
    await join.grantRole(ROOT, timelock.address)
    console.log(`join.grantRoles(ROOT, timelock)`)
    while (!(await join.hasRole(ROOT, timelock.address))) {}
  }

  return join
}

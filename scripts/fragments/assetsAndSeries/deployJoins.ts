import { ethers, waffle } from 'hardhat'
import { verify } from '../../../shared/helpers'
import { ROOT } from '../../../shared/constants'

import JoinArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/Join.sol/Join.json'

import { ERC20Mock, Timelock, Join } from '../../../typechain'
import { AssetEntity } from '../../../shared/types'

const { deployContract } = waffle

/**
 * @dev This script deploys a number of Joins
 */

export const deployJoins = async (
  ownerAcc: any,
  timelock: any,
  joinData: Array<AssetEntity>
): Promise<Map<string, Join>> => {
  let joins: Map<string, Join> = new Map()

  for (const asset of joinData) {
    let join: Join
    join = (await deployContract(ownerAcc, JoinArtifact, [asset.address])) as Join
    console.log(`Join deployed at ${join.address} for ${asset.address}`)
    verify(join.address, [asset.address])

    if (!(await join.hasRole(ROOT, timelock.address))) {
      await join.grantRole(ROOT, timelock.address)
      console.log(`join.grantRoles(ROOT, timelock)`)
      while (!(await join.hasRole(ROOT, timelock.address))) {}
    }

    joins.set(asset.assetId, join)
  }

  return joins
}

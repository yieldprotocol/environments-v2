import { ethers, waffle } from 'hardhat'
import { verify } from '../../../shared/helpers'
import { ROOT } from '../../../shared/constants'

import JoinArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/Join.sol/Join.json'

import { Timelock, Join } from '../../../typechain'

const { deployContract } = waffle

/**
 * @dev This script deploys a number of Joins
 */

export const deployJoins1155 = async (
  ownerAcc: any,
  timelock: Timelock,
  joinData: Array<[string, string, string]>
): Promise<Map<string, Join>> => {
  let joins: Map<string, Join> = new Map()
  for (let [assetId, fCashId, fCashAddress] of joinData) {
    let join: Join
    join = (await deployContract(ownerAcc, JoinArtifact, [fCashAddress, fCashId])) as Join
    console.log(`Join deployed at ${join.address} for ${fCashAddress} and ${fCashId}`)
    verify(join.address, [fCashAddress, fCashId])

    if (!(await join.hasRole(ROOT, timelock.address))) {
      await join.grantRole(ROOT, timelock.address)
      console.log(`join.grantRoles(ROOT, timelock)`)
      while (!(await join.hasRole(ROOT, timelock.address))) {}
    }

    joins.set(assetId, join)
  }

  return joins
}

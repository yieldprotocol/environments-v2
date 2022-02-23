import { ethers, waffle } from 'hardhat'
import { verify } from '../../../shared/helpers'
import { ROOT } from '../../../shared/constants'

import Join1155Artifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/other/notional/Join1155.sol/Join1155.json'

import { Timelock, Join1155 } from '../../../typechain'

const { deployContract } = waffle

/**
 * @dev This script deploys a number of Joins
 */

export const deployJoins1155 = async (
  ownerAcc: any,
  timelock: Timelock,
  joinData: Array<[string, number, string]>
): Promise<Map<string, Join1155>> => {
  let joins: Map<string, Join1155> = new Map()
  for (let [assetId, fCashId, fCashAddress] of joinData) {
    let join: Join1155
    join = (await deployContract(ownerAcc, Join1155Artifact, [fCashAddress, fCashId])) as Join1155
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

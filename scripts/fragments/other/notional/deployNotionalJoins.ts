import { ethers, waffle } from 'hardhat'
import { verify } from '../../../../shared/helpers'
import { ROOT } from '../../../../shared/constants'

import NotionalJoinArtifact from '../../../../artifacts/@yield-protocol/vault-v2/contracts/other/notional/NotionalJoin.sol/NotionalJoin.json'

import { Timelock, NotionalJoin } from '../../../../typechain'

const { deployContract } = waffle

/**
 * @dev This script deploys a number of Joins
 */

export const deployNotionalJoins = async (
  ownerAcc: any,
  timelock: Timelock,
  joinData: Array<[string, string, string, string, number, number]>
): Promise<Map<string, NotionalJoin>> => {
  let joins: Map<string, NotionalJoin> = new Map()
  for (let [assetId, fCashAddress, underlyingAddress, underlyingJoinAddress, maturity, currencyId] of joinData) {
    let join: NotionalJoin
    join = (await deployContract(ownerAcc, NotionalJoinArtifact, [
      fCashAddress,
      underlyingAddress,
      underlyingJoinAddress,
      maturity,
      currencyId,
    ])) as NotionalJoin
    console.log(
      `NotionalJoin deployed at ${join.address} for fCash maturing at ${maturity} with currency ${currencyId}`
    )
    verify(join.address, [fCashAddress, underlyingAddress, underlyingJoinAddress, maturity, currencyId])

    if (!(await join.hasRole(ROOT, timelock.address))) {
      await join.grantRole(ROOT, timelock.address)
      console.log(`join.grantRoles(ROOT, timelock)`)
      while (!(await join.hasRole(ROOT, timelock.address))) {}
    }

    joins.set(assetId, join)
  }

  return joins
}

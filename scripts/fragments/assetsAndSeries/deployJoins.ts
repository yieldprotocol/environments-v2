import { ethers } from 'hardhat'
import { ROOT, ZERO_ADDRESS } from '../../../shared/constants'
import { tenderlyVerify, verify } from '../../../shared/helpers'
import { Join, Ladle, Timelock } from '../../../typechain'

/**
 * @dev This script deploys a number of Joins
 */

export const deployJoins = async (
  ownerAcc: any,
  timelock: Timelock,
  ladle: Ladle,
  joinData: Array<[string, string]>
): Promise<Map<string, Join>> => {
  let joins: Map<string, Join> = new Map()
  for (let [assetId, assetAddress] of joinData) {
    const joinAddress = await ladle.joins(assetId)
    if (joinAddress === ZERO_ADDRESS) {
      const join = await (await ethers.getContractFactory('Join', ownerAcc)).deploy(assetAddress)
      await join.deployed()
      console.log(`Join deployed at ${join.address} for ${assetAddress}`)
      verify(join.address, [assetAddress])
      if (!(await join.hasRole(ROOT, timelock.address))) {
        const tx = await join.grantRole(ROOT, timelock.address)
        await tx.wait(1)
        console.log(`join.grantRoles(ROOT, timelock)`)
        while (!(await join.hasRole(ROOT, timelock.address))) {}
      }
      joins.set(assetId, join)
    } else {
      console.log(`Join for assetId: ${assetId} already exists at: ${joinAddress}`)
    }
  }

  return joins
}

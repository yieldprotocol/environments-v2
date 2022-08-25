import { ethers, waffle } from 'hardhat'
import { ROOT, ZERO_ADDRESS } from '../../../shared/constants'
import { verify } from '../../../shared/helpers'
import JoinArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/Join.sol/Join.json'
import { Join, Ladle, Timelock } from '../../../typechain'

const { deployContract } = waffle

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
    const joinDoesNotExist = (await ladle.joins(assetId)) === ZERO_ADDRESS
    if (joinDoesNotExist) {
      const join = await (await ethers.getContractFactory('Join', ownerAcc)).deploy(assetAddress)
      await join.deployed()
      console.log(`Join deployed at ${join.address} for ${assetAddress}`)
      verify(join.address, [assetAddress])
      if (!(await join.hasRole(ROOT, timelock.address))) {
        await join.grantRole(ROOT, timelock.address)
        console.log(`join.grantRoles(ROOT, timelock)`)
        while (!(await join.hasRole(ROOT, timelock.address))) {}
      }
      joins.set(assetId, join)
    } else {
      console.log(`Join for assetId: ${assetId} already exists at: ${assetAddress}`)
    }
  }

  return joins
}

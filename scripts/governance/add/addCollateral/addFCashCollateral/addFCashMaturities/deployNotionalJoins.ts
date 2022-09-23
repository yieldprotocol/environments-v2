import { ethers } from 'hardhat'
import { writeAddressMap, getOwnerOrImpersonate } from '../../../../../shared/helpers'

const { developer, notionalJoins } = require(process.env.CONF as string)
const { protocol } = require(process.env.CONF as string)

/**
 * @dev This script deploys a Join
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)
  const factory = await ethers.getContractAt(
    'NotionalJoinFactory',
    protocol.get('notionalJoinFactory') as string,
    ownerAcc
  )

  const newJoins: Map<string, string> = new Map()
  for (let [oldJoinId, newJoinId] of notionalJoins) {
    const joinAddress = await factory.callStatic.deploy(oldJoinId, newJoinId, 0)
    await (await factory.deploy(oldJoinId, newJoinId, 0)).wait(1)
    newJoins.set(newJoinId, joinAddress)
  }

  writeAddressMap('newJoins.json', newJoins) // newJoins.json is a tempporary file
})()

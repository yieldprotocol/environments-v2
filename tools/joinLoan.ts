import { ethers } from 'hardhat'
import { impersonate } from '../shared/helpers'
import { WAD } from '../shared/constants'
const { whales, joinLoans, protocol } = require(process.env.CONF as string)
/**
 * @dev This script loads Joins with arbitrary amounts. Only usable on forks.
 */
;(async () => {
  let ladleAcc = await impersonate(protocol.get('ladle') as string, WAD)
  const ladle = (await ethers.getContractAt('Ladle', ladleAcc.address, ladleAcc))

  for (let [assetId, loanAmount] of joinLoans) {
    const whaleAcc = await impersonate(whales.get(assetId) as string, WAD)

    const join = (await ethers.getContractAt('Join', await ladle.joins(assetId), ladleAcc))
    const asset = (await ethers.getContractAt('ERC20', await join.asset(), whaleAcc))

    await asset.transfer(join.address, loanAmount)
    await join.join(join.address, loanAmount)
    console.log(`Loaned ${loanAmount} of ${assetId} to the join at ${join.address}`)
  }
})()

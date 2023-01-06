import { impersonate } from '../shared/helpers'
import { WAD, LADLE } from '../shared/constants'
import { ERC20__factory, Ladle__factory, Join__factory } from '../typechain'
const { whales, joinLoans, protocol } = require(process.env.CONF as string)
/**
 * @dev This script loads Joins with arbitrary amounts. Only usable on forks.
 */
;(async () => {
  const ladleAddress = protocol.getOrThrow(LADLE)!
  const ladleAcc = await impersonate(ladleAddress, WAD)
  const ladle = Ladle__factory.connect(ladleAddress, ladleAcc)

  for (let [assetId, loanAmount] of joinLoans) {
    const whaleAcc = await impersonate(whales.getOrThrow(assetId)!, WAD)

    const join = Join__factory.connect(await ladle.joins(assetId), ladleAcc)
    const asset = ERC20__factory.connect(await join.asset(), whaleAcc)

    await asset.transfer(join.address, loanAmount)
    await join.join(join.address, loanAmount)
    console.log(`Loaned ${loanAmount} of ${assetId} to the join at ${join.address}`)
  }
})()

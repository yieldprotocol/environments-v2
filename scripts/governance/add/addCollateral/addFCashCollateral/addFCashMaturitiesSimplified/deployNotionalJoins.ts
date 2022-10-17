import { writeAddressMap, getOwnerOrImpersonate, addressHasCode } from '../../../../../../shared/helpers'

import { deployNotionalJoins } from '../../../../../fragments/other/notional/deployNotionalJoins'

import { Timelock__factory, Ladle__factory, NotionalJoin__factory } from '../../../../../../typechain'
import { TIMELOCK, LADLE } from '../../../../../../shared/constants'
const { developer, governance, protocol, notionalAssets } = require(process.env.CONF as string)

/**
 * @dev This script deploys a series of NotionalJoins taking existing ones as an example, and moving the maturity to the next quarterly tenor
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)
  const timelock = Timelock__factory.connect(governance.get(TIMELOCK)!, ownerAcc)
  const ladle = Ladle__factory.connect(protocol.get(LADLE)!, ownerAcc)

  const assetsToAdd: Array<[string, string, string, string, number, number]> = []
  for (let [oldAssetId, newAssetId] of notionalAssets) {
    const oldJoinAddress = await ladle.joins(oldAssetId)

    if (!addressHasCode(oldJoinAddress)) throw new Error(`Join ${oldAssetId} not in Ladle`)
    const oldJoin = NotionalJoin__factory.connect(oldJoinAddress, ownerAcc)
    assetsToAdd.push([
      newAssetId,
      await oldJoin.asset(), // fcash: address of the fCash contract
      await oldJoin.underlying(), // underlying: address of the fCash underlying
      await oldJoin.underlyingJoin(), // underlyingJoin: address of the fCash underlying Join
      (await oldJoin.maturity()) + 86400, // fCashMaturity: maturity in Notional Finance
      await oldJoin.currencyId(), // fCashCurrency: id of the underlying in Notional Finance
    ])
  }

  const newJoins = await deployNotionalJoins(ownerAcc, timelock, assetsToAdd)
  writeAddressMap('newJoins.json', newJoins) // newJoins.json is a tempporary file
})()

import { CAULDRON, CLOAK, COMPOSITE, LADLE, TIMELOCK, WITCH } from '../../../../../shared/constants'
import { getOwnerOrImpersonate, propose } from '../../../../../shared/helpers'
import {
  Cauldron__factory,
  Ladle__factory,
  Timelock__factory,
  EmergencyBrake__factory,
  Witch__factory,
  CompositeMultiOracle__factory,
  Join__factory,
} from '../../../../../typechain'
import { addAsset } from '../../../../fragments/assetsAndSeries/addAsset'

import { addIlk } from '../../../../fragments/assetsAndSeries/addIlk'
import { addIlkToSeries } from '../../../../fragments/assetsAndSeries/addIlkToSeries'
import { makeIlk } from '../../../../fragments/assetsAndSeries/makeIlk'
import { updateCompositePaths } from '../../../../fragments/oracles/updateCompositePaths'
import { updateCompositeSources } from '../../../../fragments/oracles/updateCompositeSources'
import { grantRoot } from '../../../../fragments/permissions/grantRoot'
import { addIlkToWitch } from '../../../../fragments/witch/addIlkToWitch'

const {
  developer,
  ilkToETH,
  ilkToDAI,
  ilkToUSDC,
  reth,
  protocol,
  governance,
  joins,
  ethSeries,
  daiSeries,
  usdcSeries,
  oraclePaths,
  oracleSources,
} = require(process.env.CONF!)

;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)
  const cauldron = Cauldron__factory.connect(protocol().getOrThrow(CAULDRON)!, ownerAcc)
  const ladle = Ladle__factory.connect(protocol().getOrThrow(LADLE)!, ownerAcc)
  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK)!, ownerAcc)
  const cloak = EmergencyBrake__factory.connect(governance.getOrThrow(CLOAK)!, ownerAcc)
  const witch = Witch__factory.connect(protocol().getOrThrow(WITCH)!, ownerAcc)
  const compositeOracle = CompositeMultiOracle__factory.connect(protocol().getOrThrow(COMPOSITE)!, ownerAcc)
  const hosts = []
  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []

  proposal = proposal.concat(await updateCompositeSources(compositeOracle, oracleSources))
  proposal = proposal.concat(await updateCompositePaths(compositeOracle, oraclePaths))
  proposal = proposal.concat(await grantRoot(ownerAcc, cloak.address, [joins.getOrThrow(reth.assetId)]))
  // Asset
  proposal = proposal.concat(await addAsset(ownerAcc, cloak, cauldron, ladle, reth, joins))
  proposal = proposal.concat(await addIlk(ownerAcc, cloak, cauldron, witch, ethSeries, ilkToETH, joins, false))
  proposal = proposal.concat(await addIlk(ownerAcc, cloak, cauldron, witch, daiSeries, ilkToDAI, joins, false))
  proposal = proposal.concat(await addIlk(ownerAcc, cloak, cauldron, witch, usdcSeries, ilkToUSDC, joins, false))
  // We are calling this separately as we want the ilk to be added to the witch only once
  proposal = proposal.concat(
    await addIlkToWitch(cloak, witch, reth.assetId, Join__factory.connect(joins.get(reth.assetId)!, ownerAcc))
  )
  await propose(timelock, proposal, developer)
})()

import {
  CLOAK,
  COMPOSITE,
  CONTANGO_CAULDRON,
  CONTANGO_LADLE,
  CONTANGO_WITCH,
  TIMELOCK,
  YIELD_SPACE_MULTI_ORACLE,
} from '../../../../shared/constants'
import { getOwnerOrImpersonate, propose } from '../../../../shared/helpers'
import {
  Cauldron__factory,
  CompositeMultiOracle__factory,
  ContangoLadle__factory,
  ContangoWitch__factory,
  OldEmergencyBrake__factory,
  Timelock__factory,
  YieldSpaceMultiOracle__factory,
} from '../../../../typechain'
import { orchestrateNewInstruments } from './orchestrateNewInstrumentsFragment'

const {
  developer,
  protocol,
  governance,
  assetsToAdd,
  seriesToAdd,
  fyTokenDebtLimits,
  seriesIlks,
  compositeSources,
  compositePaths,
  pools,
  joins,
  auctionLineAndLimits,
} = require(process.env.CONF!)

/**
 * @dev This script configures the Yield Protocol to use fyTokens as collateral.
 */
;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)

  const proposal = await orchestrateNewInstruments(
    ownerAcc,
    Cauldron__factory.connect(protocol.getOrThrow(CONTANGO_CAULDRON), ownerAcc),
    ContangoLadle__factory.connect(protocol.getOrThrow(CONTANGO_LADLE), ownerAcc),
    ContangoWitch__factory.connect(protocol.getOrThrow(CONTANGO_WITCH), ownerAcc),
    OldEmergencyBrake__factory.connect(governance.getOrThrow(CLOAK), ownerAcc),
    CompositeMultiOracle__factory.connect(protocol.getOrThrow(COMPOSITE), ownerAcc),
    YieldSpaceMultiOracle__factory.connect(protocol.getOrThrow(YIELD_SPACE_MULTI_ORACLE), ownerAcc),
    assetsToAdd,
    compositeSources,
    compositePaths,
    pools,
    seriesToAdd,
    fyTokenDebtLimits,
    auctionLineAndLimits,
    joins,
    seriesIlks
  )

  await propose(Timelock__factory.connect(governance.getOrThrow(TIMELOCK), ownerAcc), proposal, ownerAcc.address)
})()

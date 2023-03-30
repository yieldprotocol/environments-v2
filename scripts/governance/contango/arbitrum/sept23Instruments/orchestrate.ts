import {
  CLOAK,
  COMPOSITE,
  CONTANGO_CAULDRON,
  CONTANGO_LADLE,
  CONTANGO_WITCH,
  TIMELOCK,
  YIELD_SPACE_MULTI_ORACLE,
} from '../../../../../shared/constants'
import { getOwnerOrImpersonate, propose } from '../../../../../shared/helpers'
import {
  Cauldron__factory,
  CompositeMultiOracle__factory,
  ContangoLadle__factory,
  ContangoWitch__factory,
  EmergencyBrake__factory,
  Join__factory,
  Timelock__factory,
  YieldSpaceMultiOracle__factory,
} from '../../../../../typechain'
import { updateDebtLimits } from '../../../../fragments/limits/updateDebtLimits'
import { updateCollateralization } from '../../../../fragments/oracles/updateCollateralization'
import { setLineAndLimit } from '../../../../fragments/witch/setLineAndLimit'
import { Ilk } from '../../../confTypes'
import { orchestrateNewInstruments } from '../../shared/orchestrateNewInstrumentsFragment'

const {
  developer,
  protocol,
  governance,
  newJoins,
  assetsToAdd: assets,
  compositeSources,
  compositePaths,
  pools,
  joins,
  series,
  newIlks,
  juneIlks,
} = require(process.env.CONF!)

/**
 * @dev This script configures the Yield Protocol to use fyTokens as collateral.
 */
;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)
  const timelock = Timelock__factory.connect(governance.get(TIMELOCK)!, ownerAcc)
  const cauldron = Cauldron__factory.connect(protocol.getOrThrow(CONTANGO_CAULDRON), ownerAcc)
  const witch = ContangoWitch__factory.connect(protocol.getOrThrow(CONTANGO_WITCH), ownerAcc)

  const newInstrumentsProposal = await orchestrateNewInstruments(
    ownerAcc,
    cauldron,
    ContangoLadle__factory.connect(protocol.getOrThrow(CONTANGO_LADLE), ownerAcc),
    witch,
    EmergencyBrake__factory.connect(governance.getOrThrow(CLOAK), ownerAcc),
    CompositeMultiOracle__factory.connect(protocol.getOrThrow(COMPOSITE), ownerAcc),
    YieldSpaceMultiOracle__factory.connect(protocol.getOrThrow(YIELD_SPACE_MULTI_ORACLE), ownerAcc),
    timelock,
    newJoins.map((j: string) => Join__factory.connect(j, ownerAcc)),
    assets,
    compositeSources,
    compositePaths,
    pools,
    joins,
    series,
    newIlks
  )

  const juneInstrumentsProposal = juneIlks.map((ilk: Ilk) => {
    ;[
      updateDebtLimits(cauldron, ilk),
      updateCollateralization(cauldron, ilk.collateralization),
      setLineAndLimit(witch, ilk.auctionLineAndLimit!),
    ]
  })

  await propose(timelock, [...newInstrumentsProposal, ...juneInstrumentsProposal], ownerAcc.address)
})()

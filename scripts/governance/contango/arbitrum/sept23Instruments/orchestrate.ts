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
import { addIlkToSeries } from '../../../../fragments/assetsAndSeries/addIlkToSeries'
import { updateDebtLimits } from '../../../../fragments/limits/updateDebtLimits'
import { orchestrateYieldSpaceMultiOracle } from '../../../../fragments/oracles/orchestrateYieldSpaceMultiOracle'
import { updateCollateralization } from '../../../../fragments/oracles/updateCollateralization'
import { setLineAndLimit } from '../../../../fragments/witch/setLineAndLimit'
import { Ilk, Series } from '../../../confTypes'
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
  newSeries,
  juneSeries,
  basesToAdd,
} = require(process.env.CONF!)

/**
 * @dev This script configures the Yield Protocol to use fyTokens as collateral.
 */
;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)
  const timelock = Timelock__factory.connect(governance.get(TIMELOCK)!, ownerAcc)
  const cauldron = Cauldron__factory.connect(protocol.getOrThrow(CONTANGO_CAULDRON), ownerAcc)
  const witch = ContangoWitch__factory.connect(protocol.getOrThrow(CONTANGO_WITCH), ownerAcc)
  const yieldSpaceMultiOracle = YieldSpaceMultiOracle__factory.connect(
    protocol.getOrThrow(YIELD_SPACE_MULTI_ORACLE),
    ownerAcc
  )

  const yieldSpaceMultiOracleProposal = await orchestrateYieldSpaceMultiOracle(
    ownerAcc.address,
    yieldSpaceMultiOracle,
    timelock
  )

  const newInstrumentsProposal = await orchestrateNewInstruments(
    ownerAcc,
    cauldron,
    ContangoLadle__factory.connect(protocol.getOrThrow(CONTANGO_LADLE), ownerAcc),
    witch,
    EmergencyBrake__factory.connect(governance.getOrThrow(CLOAK), ownerAcc),
    CompositeMultiOracle__factory.connect(protocol.getOrThrow(COMPOSITE), ownerAcc),
    yieldSpaceMultiOracle,
    timelock,
    newJoins.map((j: string) => Join__factory.connect(j, ownerAcc)),
    assets,
    compositeSources,
    compositePaths,
    pools,
    joins,
    newSeries,
    basesToAdd
  )

  console.log('Updating June instruments')
  const juneIlks: Ilk[] = Array.from(new Set<Ilk>(juneSeries.map((s: Series) => s.ilks).flat()))
  const juneInstrumentsProposal = await Promise.all(
    [
      juneIlks.map((ilk) => updateDebtLimits(cauldron, ilk, 3)),
      juneIlks.map((ilk) => updateCollateralization(cauldron, ilk.collateralization, 3)),
      juneIlks
        .filter((ilk) => ilk.auctionLineAndLimit)
        .map((ilk) => setLineAndLimit(witch, ilk.auctionLineAndLimit!, 3)),
      juneSeries.map((s: Series) =>
        s.ilks.filter((ilk) => ilk.baseId === ilk.ilkId).map((ilk) => addIlkToSeries(cauldron, s, ilk, 3))
      ),
    ].flat(4)
  ).then((x) => x.flat())

  await propose(
    timelock,
    [...yieldSpaceMultiOracleProposal, ...newInstrumentsProposal, ...juneInstrumentsProposal],
    ownerAcc.address
  )
})()

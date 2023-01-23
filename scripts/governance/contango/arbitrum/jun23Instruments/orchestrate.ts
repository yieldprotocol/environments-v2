import {
  CLOAK,
  COMPOSITE,
  CONTANGO_CAULDRON,
  CONTANGO_LADLE,
  CONTANGO_WITCH,
  DAI,
  ETH,
  FYDAI2303,
  FYETH2303,
  FYUSDC2303,
  TIMELOCK,
  USDC,
  YIELD_SPACE_MULTI_ORACLE,
} from '../../../../../shared/constants'
import { getOwnerOrImpersonate, propose } from '../../../../../shared/helpers'
import {
  Cauldron__factory,
  CompositeMultiOracle__factory,
  ContangoLadle__factory,
  ContangoWitch__factory,
  OldEmergencyBrake__factory,
  Timelock__factory,
  YieldSpaceMultiOracle__factory,
} from '../../../../../typechain'
import { updateCeilingProposal } from '../../../../fragments/limits/updateCeilingProposal'
import { orchestrateNewInstruments } from '../../shared/orchestrateNewInstrumentsFragment'

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

  const cauldron = Cauldron__factory.connect(protocol.getOrThrow(CONTANGO_CAULDRON), ownerAcc)

  const proposal = await orchestrateNewInstruments(
    ownerAcc,
    cauldron,
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

  // Increase the debt ceiling for existing instruments
  proposal.push(
    ...(await updateCeilingProposal(cauldron, [
      [DAI, FYUSDC2303, 50_000], // dai collateralised with fyUsdc
      [DAI, FYETH2303, 50_000], // dai collateralised with fyEth
      [USDC, FYDAI2303, 50_000], // usdc collateralised with fyDai
      [USDC, FYETH2303, 50_000], // usdc collateralised with fyETH
      [ETH, FYUSDC2303, 50_000000], // eth collateralised with fyUsdc
      [ETH, FYDAI2303, 50_000000], // eth collateralised with fyDai
    ]))
  )

  await propose(Timelock__factory.connect(governance.getOrThrow(TIMELOCK), ownerAcc), proposal, ownerAcc.address)
})()

import {
  VR_CAULDRON,
  VR_LADLE,
  VR_WITCH,
  TIMELOCK,
  ACCUMULATOR,
  CLOAK,
  VARIABLE_RATE_ORACLE,
  VR_ROUTER,
} from '../../../../../shared/constants'
import { getOwnerOrImpersonate, propose } from '../../../../../shared/helpers'
import {
  VRCauldron__factory,
  VRLadle__factory,
  VRWitch__factory,
  Timelock__factory,
  AccumulatorMultiOracle__factory,
  EmergencyBrake__factory,
  Cauldron__factory,
  Ladle__factory,
  IOracle,
  Witch,
  VYToken__factory,
  Join__factory,
  VariableInterestRateOracle__factory,
  VRRouter__factory,
} from '../../../../../typechain'
import { addAsset } from '../../../../fragments/assetsAndSeries/addAsset'
import { addVRIlk } from '../../../../fragments/assetsAndSeries/addVRIlk'
import { makeIlk } from '../../../../fragments/assetsAndSeries/makeIlk'
import { makeVRBase } from '../../../../fragments/assetsAndSeries/makeVRBase'
import { orchestrateJoin } from '../../../../fragments/assetsAndSeries/orchestrateJoin'
import { orchestrateVRCauldron } from '../../../../fragments/core/orchestrateVRCauldron'
import { orchestrateVRLadle } from '../../../../fragments/core/orchestrateVRLadle'
import { orchestrateVRWitch } from '../../../../fragments/core/orchestrateVRWitch'
import { addIntegration } from '../../../../fragments/ladle/addIntegration'
import { orchestrateVariableInterestRateOracle } from '../../../../fragments/oracles/orchestrateVariableInterestOracle'
import { updateAccumulatorSources } from '../../../../fragments/oracles/updateAccumulatorSources'
import { setVariableInterestRateOracleParams } from '../../../../fragments/oracles/setVariableInterestRateOracleParams'
import { orchestrateVYToken } from '../../../../fragments/other/orchestrateVYToken'
import { addToken } from '../../../../fragments/ladle/addToken'
import { orchestrateVRRouter } from '../../../../fragments/other/orchestrateVRRouter'

const {
  developer,
  deployers,
  protocol,
  governance,
  accumulatorSources,
  variableInterestRateOracleSources,
  assetsToAdd,
  basesToAdd,
  joins,
  ilks,
  vyTokens,
  vyTokensToAdd,
} = require(process.env.CONF!)

;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)
  const vrCauldron = VRCauldron__factory.connect(protocol().getOrThrow(VR_CAULDRON)!, ownerAcc)
  const cauldron = Cauldron__factory.connect(protocol().getOrThrow(VR_CAULDRON)!, ownerAcc)
  const vrLadle = VRLadle__factory.connect(protocol().getOrThrow(VR_LADLE)!, ownerAcc)
  const ladle = Ladle__factory.connect(protocol().getOrThrow(VR_LADLE)!, ownerAcc)
  const witch = VRWitch__factory.connect(protocol().getOrThrow(VR_WITCH)!, ownerAcc)
  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK)!, ownerAcc)
  const cloak = EmergencyBrake__factory.connect(governance.getOrThrow(CLOAK)!, ownerAcc)
  const vrRouter = VRRouter__factory.connect(protocol().getOrThrow(VR_ROUTER)!, ownerAcc)
  const variableInterestRateOracle = VariableInterestRateOracle__factory.connect(
    protocol().getOrThrow(VARIABLE_RATE_ORACLE)!,
    ownerAcc
  )

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []

  proposal = proposal.concat(
    await orchestrateVariableInterestRateOracle(
      deployers.getOrThrow(variableInterestRateOracle.address)!,
      variableInterestRateOracle,
      timelock,
      cloak,
      0
    )
  )

  // proposal = proposal.concat(await updateAccumulatorSources(accumulatorOracle, accumulatorSources))

  proposal = proposal.concat(
    await orchestrateVRCauldron(deployers.getOrThrow(cauldron.address)!, vrCauldron, timelock, cloak, 0)
  )
  proposal = proposal.concat(
    await orchestrateVRLadle(deployers.getOrThrow(ladle.address)!, vrCauldron, vrLadle, timelock, cloak, 0)
  )
  proposal = proposal.concat(await addIntegration(ladle, protocol().getOrThrow('wrapEtherModule')!))

  proposal = proposal.concat(await orchestrateVRWitch(deployers.getOrThrow(witch.address)!, witch, timelock, cloak, 0))
  proposal = proposal.concat(await orchestrateVRRouter(vrRouter, ladle))

  for (const asset of assetsToAdd) {
    proposal = proposal.concat(
      await orchestrateJoin(
        deployers.getOrThrow(joins.getOrThrow(asset.assetId)!)!,
        timelock,
        cloak,
        Join__factory.connect(joins.getOrThrow(asset.assetId)!, ownerAcc)
      )
    )
    proposal = proposal.concat(await addAsset(ownerAcc, cloak, cauldron, ladle, asset, joins))
    proposal = proposal.concat(await addToken(ladle, asset.address))
  }

  proposal = proposal.concat(
    await setVariableInterestRateOracleParams(variableInterestRateOracle, variableInterestRateOracleSources)
  )

  //makeBase
  for (const base of basesToAdd) {
    proposal = proposal.concat(
      await makeVRBase(
        ownerAcc,
        cloak,
        variableInterestRateOracle as unknown as IOracle,
        vrCauldron,
        witch,
        base,
        joins
      )
    )
  }
  //makeIlk
  for (const ilk of ilks) {
    proposal = proposal.concat(await makeIlk(ownerAcc, cloak, cauldron, witch as unknown as Witch, ilk, joins))
    proposal = proposal.concat(await addVRIlk(vrCauldron, ilk))
  }

  // OrchestrateVYToken
  for (const vyToken of vyTokensToAdd) {
    const vyTokenContract = VYToken__factory.connect(vyTokens.getOrThrow(vyToken)!, ownerAcc)
    proposal = proposal.concat(
      await orchestrateVYToken(
        deployers.getOrThrow(vyTokenContract.address)!,
        vyTokenContract,
        timelock,
        vrRouter,
        cloak,
        0
      )
    )
    proposal = proposal.concat(await addIntegration(ladle, vyTokenContract.address))
    proposal = proposal.concat(await addToken(ladle, vyTokenContract.address))
  }
  if (proposal.length > 0) await propose(timelock, proposal, developer)
})()

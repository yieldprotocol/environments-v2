import { VR_CAULDRON, VR_LADLE, VR_WITCH, TIMELOCK, ACCUMULATOR, CLOAK } from '../../../../../shared/constants'
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
} from '../../../../../typechain'
import { addAsset } from '../../../../fragments/assetsAndSeries/addAsset'
import { addVRIlk } from '../../../../fragments/assetsAndSeries/addVRIlk'
import { makeIlk } from '../../../../fragments/assetsAndSeries/makeIlk'
import { makeVRBase } from '../../../../fragments/assetsAndSeries/makeVRBase'
import { orchestrateVRCauldron } from '../../../../fragments/core/orchestrateVRCauldron'
import { orchestrateVRLadle } from '../../../../fragments/core/orchestrateVRLadle'
import { orchestrateVRWitch } from '../../../../fragments/core/orchestrateVRWitch'
import { updateAccumulatorSources } from '../../../../fragments/oracles/updateAccumulatorSources'

const {
  developer,
  deployers,
  protocol,
  governance,
  accumulatorSources,
  assetsToAdd,
  basesToAdd,
  joins,
  ilks,
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
  const accumulatorOracle = AccumulatorMultiOracle__factory.connect(protocol().getOrThrow(ACCUMULATOR)!, ownerAcc)

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []

  proposal = proposal.concat(await updateAccumulatorSources(accumulatorOracle, accumulatorSources))

  proposal = proposal.concat(
    await orchestrateVRCauldron(protocol().getOrThrow(VR_CAULDRON)!, vrCauldron, timelock, cloak, 0)
  )
  proposal = proposal.concat(
    await orchestrateVRLadle(protocol().getOrThrow(VR_LADLE)!, vrCauldron, vrLadle, timelock, cloak, 0)
  )
  console.log('here')
  proposal = proposal.concat(await orchestrateVRWitch(protocol().getOrThrow(VR_WITCH)!, witch, timelock, cloak, 0))

  for (const asset of assetsToAdd) {
    proposal = proposal.concat(await addAsset(ownerAcc, cloak, cauldron, ladle, asset, joins))
  }

  //makeBase
  for (const base of basesToAdd) {
    proposal = proposal.concat(
      await makeVRBase(ownerAcc, cloak, accumulatorOracle as unknown as IOracle, vrCauldron, witch, base, joins)
    )
  }
  //makeIlk
  for (const ilk of ilks) {
    proposal = proposal.concat(await makeIlk(ownerAcc, cloak, cauldron, witch as unknown as Witch, ilk, joins))
    proposal = proposal.concat(await addVRIlk(vrCauldron, ilk))
  }

  if (proposal.length > 0) await propose(timelock, proposal, developer)
})()

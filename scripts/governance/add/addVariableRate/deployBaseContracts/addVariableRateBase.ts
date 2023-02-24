import { VR_CAULDRON, VR_LADLE, VR_WITCH, TIMELOCK, ACCUMULATOR, CLOAK } from '../../../../../shared/constants'
import { getOwnerOrImpersonate } from '../../../../../shared/helpers'
import {
  VRCauldron__factory,
  VRLadle__factory,
  VRWitch__factory,
  Timelock__factory,
  AccumulatorMultiOracle__factory,
  EmergencyBrake__factory,
} from '../../../../../typechain'
import { orchestrateVRCauldron } from '../../../../fragments/core/orchestrateVRCauldron'
import { orchestrateVRLadle } from '../../../../fragments/core/orchestrateVRLadle'
import { orchestrateVRWitch } from '../../../../fragments/core/orchestrateVRWitch'

const { developer, deployers, protocol, governance } = require(process.env.CONF!)

;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)
  const cauldron = VRCauldron__factory.connect(protocol().getOrThrow(VR_CAULDRON)!, ownerAcc)
  const ladle = VRLadle__factory.connect(protocol().getOrThrow(VR_LADLE)!, ownerAcc)
  const witch = VRWitch__factory.connect(protocol().getOrThrow(VR_WITCH)!, ownerAcc)
  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK)!, ownerAcc)
  const cloak = EmergencyBrake__factory.connect(governance.getOrThrow(CLOAK)!, ownerAcc)
  const accumulatorOracle = AccumulatorMultiOracle__factory.connect(protocol().getOrThrow(ACCUMULATOR)!, ownerAcc)

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []

  proposal = proposal.concat(
    await orchestrateVRCauldron(deployers.getOrThrow(VR_CAULDRON)!, cauldron, timelock, cloak, 0)
  )
  proposal = proposal.concat(
    await orchestrateVRLadle(deployers.getOrThrow(VR_LADLE)!, cauldron, ladle, timelock, cloak, 0)
  )
  proposal = proposal.concat(await orchestrateVRWitch(deployers.getOrThrow(VR_WITCH)!, witch, timelock, cloak, 0))
  //addAsset
  //makeBase
  //makeIlk
})()

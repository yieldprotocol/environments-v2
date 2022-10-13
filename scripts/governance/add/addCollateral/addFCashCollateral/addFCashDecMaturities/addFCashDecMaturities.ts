import { proposeApproveExecute, getOwnerOrImpersonate } from '../../../../../../shared/helpers'

import { NOTIONAL, CAULDRON, LADLE, WITCH, CLOAK, TIMELOCK } from '../../../../../../shared/constants'

import { orchestrateJoinProposal } from '../../../../../fragments/assetsAndSeries/orchestrateJoinProposal'
import { updateNotionalSourcesProposal } from '../../../../../fragments/oracles/updateNotionalSourcesProposal'
import { addAssetProposal } from '../../../../../fragments/assetsAndSeries/addAssetProposal'
import { makeIlkProposal } from '../../../../../fragments/assetsAndSeries/makeIlkProposal'
import { addIlksToSeriesProposal } from '../../../../../fragments/assetsAndSeries/addIlksToSeriesProposal'

import {
  Cauldron__factory,
  EmergencyBrake__factory,
  IOracle,
  Ladle__factory,
  NotionalMultiOracle__factory,
  Timelock__factory,
  Witch__factory,
} from '../../../../../../typechain'

const {
  developer,
  deployer,
  notionalSources,
  fCashAddress,
  notionalDebtLimits,
  auctionLimits,
  seriesIlks,
  protocol,
  governance,
  newJoins,
} = require(process.env.CONF as string)

/**
 * @dev This script configures the Yield Protocol to use fCash as collateral.
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const notionalOracle = NotionalMultiOracle__factory.connect(protocol.get(NOTIONAL)!, ownerAcc)
  const cauldron = Cauldron__factory.connect(protocol.get(CAULDRON)!, ownerAcc)
  const ladle = Ladle__factory.connect(protocol.get(LADLE)!, ownerAcc)
  const witch = Witch__factory.connect(protocol.get(WITCH)!, ownerAcc)
  const cloak = EmergencyBrake__factory.connect(governance.get(CLOAK)!, ownerAcc)
  const timelock = Timelock__factory.connect(governance.get(TIMELOCK)!, ownerAcc)

  let assetsAndJoins: Array<[string, string, string]> = []
  for (let [assetId, joinAddress] of newJoins) {
    assetsAndJoins.push([assetId, fCashAddress, joinAddress])
    console.log(`Using ${fCashAddress} as Join for ${joinAddress}`)
  }

  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await orchestrateJoinProposal(ownerAcc, deployer, ladle, timelock, cloak, assetsAndJoins))
  proposal = proposal.concat(await updateNotionalSourcesProposal(notionalOracle, notionalSources))
  proposal = proposal.concat(await addAssetProposal(ownerAcc, cauldron, ladle, assetsAndJoins))
  proposal = proposal.concat(
    await makeIlkProposal(
      ownerAcc,
      notionalOracle as unknown as IOracle,
      cauldron,
      witch,
      cloak,
      newJoins,
      notionalDebtLimits,
      auctionLimits
    )
  )
  proposal = proposal.concat(await addIlksToSeriesProposal(cauldron, seriesIlks))

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string, developer)
})()

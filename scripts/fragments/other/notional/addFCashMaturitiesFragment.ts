import { NOTIONAL, MULTISIG, CAULDRON, LADLE, WITCH, CLOAK, TIMELOCK } from '../../../../shared/constants'

import { orchestrateJoinProposal } from '../../assetsAndSeries/orchestrateJoinProposal'
import { updateNotionalSourcesProposal } from '../../oracles/updateNotionalSourcesProposal'
import { addAssetProposal } from '../../assetsAndSeries/addAssetProposal'
import { makeIlkProposal } from '../../assetsAndSeries/makeIlkProposal'
import { addIlksToSeriesProposal } from '../../assetsAndSeries/addIlksToSeriesProposal'
import {
  IOracle,
  NotionalJoin__factory,
  FYToken__factory,
  NotionalMultiOracle,
  Cauldron,
  Ladle,
  Witch,
  EmergencyBrake,
  Timelock,
} from '../../../../typechain'

export const addFCashMaturitiesFragment = async (
  ownerAcc: any,
  deployer: string,
  timelock: Timelock,
  cloak: EmergencyBrake,
  notionalOracle: NotionalMultiOracle,
  cauldron: Cauldron,
  ladle: Ladle,
  witch: Witch,
  notionalAssets: Array<[string, string, string]>,
  newJoins: Map<string, string>
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []

  let assetsAndJoins: Array<[string, string, string]> = []
  let notionalJoins: Map<string, string> = new Map()
  let notionalSources: Array<[string, string, string, string]> = []
  let notionalDebtLimits: Array<[string, string, number, number, number, number]> = []
  const auctionLimits: Array<[string, number, string, number, number, number]> = []
  let seriesIlks: Array<[string, string[]]> = []

  for (let [oldAssetId, newAssetId, newSeriesId] of notionalAssets) {
    const oldJoin = NotionalJoin__factory.connect(await ladle.joins(oldAssetId), ownerAcc)
    const fyToken = FYToken__factory.connect((await cauldron.series(newSeriesId)).fyToken, ownerAcc)
    const underlyingId = await fyToken.underlyingId()
    const fCashAddress = await oldJoin.asset()
    assetsAndJoins.push([newAssetId, fCashAddress, newJoins.get(newAssetId)!])
    notionalJoins.set(newAssetId, newJoins.get(newAssetId)!)
    notionalSources.push([fCashAddress, newAssetId, underlyingId, await oldJoin.underlying()])

    const debtLimits = await cauldron.debt(underlyingId, oldAssetId)
    const ratio = (await cauldron.spotOracles(underlyingId, oldAssetId)).ratio
    notionalDebtLimits.push([
      underlyingId,
      newAssetId,
      ratio,
      debtLimits.max.toNumber(),
      debtLimits.min,
      debtLimits.dec,
    ])

    seriesIlks.push([newSeriesId, [newAssetId]])
  }

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
      notionalJoins,
      notionalDebtLimits,
      auctionLimits
    )
  )
  proposal = proposal.concat(await addIlksToSeriesProposal(cauldron, seriesIlks))

  return proposal
}

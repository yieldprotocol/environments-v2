import { orchestrateJoin } from '../../core/removeDeployerRootToCloak'
import { updateNotionalSources } from '../../oracles/updateNotionalSources'
import { addAsset } from '../../assetsAndSeries/addAsset'
import { makeIlk } from '../../assetsAndSeries/makeIlk'
import { addIlksToSeries } from '../../assetsAndSeries/addIlkToSeries'
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
import { AuctionLineAndLimit } from '../../../governance/confTypes'

export const addFCashMaturities = async (
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
  const auctionLimits: Array<AuctionLineAndLimit> = []
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

  proposal = proposal.concat(await orchestrateJoin(ownerAcc, cloak, assetsAndJoins))
  proposal = proposal.concat(await updateNotionalSources(notionalOracle, notionalSources))
  proposal = proposal.concat(await addAsset(ownerAcc, cloak, cauldron, ladle, assetsAndJoins))
  proposal = proposal.concat(
    await makeIlk(
      ownerAcc,
      cloak,
      notionalOracle as unknown as IOracle,
      cauldron,
      witch,
      notionalDebtLimits,
      auctionLimits,
      notionalJoins
    )
  )
  proposal = proposal.concat(await addIlksToSeries(cauldron, seriesIlks))

  return proposal
}

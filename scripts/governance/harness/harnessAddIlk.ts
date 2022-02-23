import { CVX3CRV, ZERO_ADDRESS } from '../../../shared/constants'
import { proposeApproveExecute, readAddressMappingIfExists, writeAddressMap } from '../../../shared/helpers'
import { IOracle, Join } from '../../../typechain'
import { addAssetProposal } from '../../fragments/assetsAndSeries/addAssetProposal'
import { addIlksToSeriesProposal } from '../../fragments/assetsAndSeries/addIlksToSeriesProposal'
import { deployJoins } from '../../fragments/assetsAndSeries/deployJoins'
import { makeIlkProposal } from '../../fragments/assetsAndSeries/makeIlkProposal'
import { orchestrateJoinProposal } from '../../fragments/assetsAndSeries/orchestrateJoinProposal'
import { Harness } from '../../fragments/core/harness/harness'
const { assetsToAdd, debtLimits, auctionLimits, seriesIlks } = require(process.env.CONF as string)
const { newJoins } = require(process.env.BASE as string)
/**
 * @dev This script makes asset into an ilk
 */

;(async () => {
  let harness = await Harness.create()
  // AddAssetTest checks if the desired assets to be added are already present in the cauldron
  // It returns only the assets which are not present in the cauldron
  
  let owner = await harness.owner
  let timelock = await harness.timelock
  let cloak = await harness.cloak
  let cauldron = await harness.cauldron
  let witch = await harness.witch
  let compositeOracle = await harness.compositeOracle
  let debtConfig = await harness.getDebtConfig(debtLimits)
  let proposal: Array<{ target: string; data: string }> = []

  let seriesIlk = await harness.getAddableIlksInSeries(seriesIlks)
  if (seriesIlk.length > 0) {
    proposal = proposal.concat(
        await makeIlkProposal(
          owner,
          compositeOracle as unknown as IOracle,
          cauldron,
          witch,
          cloak,
          newJoins,
          debtConfig,
          auctionLimits
        )
      )
      proposal = proposal.concat(await addIlksToSeriesProposal(cauldron, seriesIlk))
      await proposeApproveExecute(timelock, proposal, (await harness).governance.get('multisig') as string)
  } else {
    // Checks if the asset is present in the cauldron
    await harness.checkIfIlksAddedInSeries(seriesIlks)
    await harness.checkDebtConfig(debtConfig)
  }
})()

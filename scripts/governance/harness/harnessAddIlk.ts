import { proposeApproveExecute } from '../../../shared/helpers'
import { IOracle } from '../../../typechain'
import { addIlksToSeriesProposal } from '../../fragments/assetsAndSeries/addIlksToSeriesProposal'
import { makeIlkProposal } from '../../fragments/assetsAndSeries/makeIlkProposal'
import { Harness } from '../../fragments/core/harness/harness'
const { debtLimits, auctionLimits, seriesIlks } = require(process.env.CONF as string)
const { newJoins } = require(process.env.BASE as string)

/**
 * @dev This script makes asset into an ilk
 */
;(async () => {
  let harness = await Harness.create()

  let owner = harness.owner
  let timelock = harness.timelock
  let cloak = harness.cloak
  let cauldron = harness.cauldron
  let witch = harness.witch
  let compositeOracle = harness.compositeOracle
  let proposal: Array<{ target: string; data: string }> = []

  // Check debt config
  let debtConfig = await harness.getDebtConfig(debtLimits)
  // Check series & if ilks are present
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
    await proposeApproveExecute(timelock, proposal, harness.governance.get('multisig') as string)
  } else {
    // Checks if the ilks were added correctly
    await harness.checkIfIlksAddedInSeries(seriesIlks)
    // Check if the debt config was set correctly
    await harness.checkDebtConfig(debtConfig)
  }
})()

import { CVX3CRV, ZERO_ADDRESS } from '../../../shared/constants'
import { proposeApproveExecute, writeAddressMap } from '../../../shared/helpers'
import { Join } from '../../../typechain'
import { addAssetProposal } from '../../fragments/assetsAndSeries/addAssetProposal'
import { deployJoins } from '../../fragments/assetsAndSeries/deployJoins'
import { orchestrateJoinProposal } from '../../fragments/assetsAndSeries/orchestrateJoinProposal'
import { Harness } from '../../fragments/core/harness/harness'
const { assetsToAdd } = require(process.env.CONF as string)
const { newJoins } = require(process.env.BASE as string)

/**
 * @dev This script adds assets to the Cauldron
 */
;(async () => {
  let harness = await Harness.create()
  // AddAssetTest checks if the desired assets to be added are already present in the cauldron
  // It returns only the assets which are not present in the cauldron
  let owner = harness.owner
  let timelock = harness.timelock
  let assetsAndJoins: [string, string, string][] = []
  let proposal: Array<{ target: string; data: string }> = []

  let assetsThatCouldbeAdded = await harness.getAddableAssets(assetsToAdd)

  for (let [assetId, assetAddress] of assetsThatCouldbeAdded) {
    // Join deployment is here just for this test but would be removed
    var join = newJoins.size == 0 ? ZERO_ADDRESS : (newJoins.get(assetId) as string)
    if (newJoins.size == 0) {
      const dep = await deployJoins(owner, timelock, assetsThatCouldbeAdded)
      join = (dep.get(CVX3CRV) as Join).address
      writeAddressMap('newJoins.json', dep)
    }
    if (join == ZERO_ADDRESS) {
      const dep = await deployJoins(owner, timelock, assetsThatCouldbeAdded)
      join = (dep.get(CVX3CRV) as Join).address
      writeAddressMap('newJoins.json', dep)
    }

    assetsAndJoins.push([assetId, assetAddress, join])
  }

  if (assetsThatCouldbeAdded.length > 0) {
    proposal = proposal.concat(
      await orchestrateJoinProposal(harness, assetsAndJoins)
    )
    proposal = proposal.concat(
      await addAssetProposal(harness, assetsAndJoins)
    )
    await proposeApproveExecute(timelock, proposal, harness.governance.get('multisig') as string)
  } else {
    // Checks if the asset was added in the cauldron
    ;(await harness).checkAssets(assetsThatCouldbeAdded)
  }
  
})()

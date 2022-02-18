import { CVX3CRV, ZERO_ADDRESS } from '../../../shared/constants'
import { proposeApproveExecute, readAddressMappingIfExists, writeAddressMap } from '../../../shared/helpers'
import { Join } from '../../../typechain'
import { addAssetProposal } from '../../fragments/assetsAndSeries/addAssetProposal'
import { deployJoins } from '../../fragments/assetsAndSeries/deployJoins'
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
  let assetsThatCouldbeAdd = await harness.addAssetTest(assetsToAdd)
  let owner = await harness.owner
  let timelock = await harness.timelock
  let assetsAndJoins: [string, string, string][] = []

  for (let [assetId, assetAddress] of assetsThatCouldbeAdd) {
    // Join deployment is here just for this test but would be removed
    var join = newJoins.size == 0 ? ZERO_ADDRESS : (newJoins.get(assetId) as string)
    if (newJoins.size == 0) {
      const dep = await deployJoins(owner, timelock, assetsThatCouldbeAdd)
      join = (dep.get(CVX3CRV) as Join).address
      writeAddressMap('newJoins.json', dep)
    }
    if (join == ZERO_ADDRESS) {
      const dep = await deployJoins(owner, timelock, assetsThatCouldbeAdd)
      join = (dep.get(CVX3CRV) as Join).address
      writeAddressMap('newJoins.json', dep)
    }

    assetsAndJoins.push([assetId, assetAddress, join])
  }


  if (assetsThatCouldbeAdd.length > 0) {
    let proposal: Array<{ target: string; data: string }> = []
    
    proposal = proposal.concat(
      await addAssetProposal(owner, (await harness).cauldron, (await harness).ladle, assetsAndJoins)
    )

    await proposeApproveExecute(timelock, proposal, (await harness).governance.get('multisig') as string)

  } else {

    // Checks if the asset is present in the cauldron
    ;(await harness).checkAssets(assetsThatCouldbeAdd)
  }
})()

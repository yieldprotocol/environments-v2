import { protocolObject } from '../../../../../shared/protocolObject'
import { CVX3CRV, ZERO_ADDRESS } from '../../../../../shared/constants'
import { proposeApproveExecute } from '../../../../../shared/helpers'
import { Join } from '../../../../../typechain'
import { addAssetProposal } from '../../../../fragments/assetsAndSeries/addAssetProposal'
import { deployJoins } from '../../../../fragments/assetsAndSeries/deployJoins'
import { orchestrateJoinProposal } from '../../../../fragments/assetsAndSeries/orchestrateJoinProposal'
const { assetsToAdd } = require(process.env.CONF as string)

/**
 * @dev This script adds assets to the Cauldron
 */
;(async () => {
  // let harness = await Harness.create()
  let protocolObj = await protocolObject.CREATE()

  // AddAssetTest checks if the desired assets to be added are already present in the cauldron
  // It returns only the assets which are not present in the cauldron
  let owner = protocolObj.dev
  let timelock = protocolObj.timelock
  let assetsAndJoins: [string, string, string][] = []
  let proposal: Array<{ target: string; data: string }> = []

  let assetsThatCouldbeAdded = await protocolObj.getAddableAssets(assetsToAdd)

  for (const asset of assetsThatCouldbeAdded) {
    var join = protocolObj.getJoin(asset.assetId)
    if (join == ZERO_ADDRESS) {
      const dep = await deployJoins(owner, timelock, assetsThatCouldbeAdded)
      join = (dep.get(CVX3CRV) as Join).address
      protocolObj.addJoins([{ address: join, assetId: CVX3CRV }])
      await protocolObj.saveObject()
    } else {
      console.log('Join present')
    }
    assetsAndJoins.push([asset.assetId, asset.address, join])
  }

  proposal = proposal.concat(await orchestrateJoinProposal(protocolObj, assetsAndJoins))
  proposal = proposal.concat(await addAssetProposal(protocolObj, assetsAndJoins))
  let status = await proposeApproveExecute(timelock, proposal, protocolObj.multisig)
  if (status == 'executed') {
    protocolObj.addAssets(assetsThatCouldbeAdded)
    // Checks if the asset was added in the cauldron
    await protocolObj.diffAssets()
    await protocolObj.saveObject()
  }
})()

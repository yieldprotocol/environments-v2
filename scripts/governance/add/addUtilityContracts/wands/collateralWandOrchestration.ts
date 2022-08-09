import { ethers } from 'hardhat'
import { proposeApproveExecute, getOwnerOrImpersonate, readAddressMappingIfExists } from '../../../../../shared/helpers'
import { orchestrateCollateralWandProposal } from '../../../../fragments/utils/orchestrateCollateralWandProposal'
const { developer, deployer, newJoins, assets } = require(process.env.CONF as string)

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const governance = readAddressMappingIfExists('governance.json')

  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc)

  let assetsAndJoins: Array<[string, string, string]> = []
  for (let [assetId, joinAddress] of newJoins) {
    assetsAndJoins.push([assetId, assets.get(assetId) as string, joinAddress])
    console.log(`${[assetId, assets.get(assetId), joinAddress]}`)
  }

  let proposal: Array<{ target: string; data: string }> = []
  proposal = await orchestrateCollateralWandProposal(ownerAcc, deployer, timelock)

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()

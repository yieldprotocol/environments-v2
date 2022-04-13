import { ethers } from 'hardhat'
import { readAddressMappingIfExists, proposeApproveExecute, getOwnerOrImpersonate } from '../../../../shared/helpers'

import { orchestrateJoinProposal } from '../../../fragments/assetsAndSeries/orchestrateJoinProposal'
import { addAssetProposal } from '../../../fragments/assetsAndSeries/addAssetProposal'
import { makeIlkProposal } from '../../../fragments/assetsAndSeries/makeIlkProposal'
import { addIlksToSeriesProposal } from '../../../fragments/assetsAndSeries/addIlksToSeriesProposal'

import {
  IOracle,
  CompositeMultiOracle,
  CompoundMultiOracle,
  Cauldron,
  Ladle,
  Witch,
  Timelock,
  EmergencyBrake,
} from '../../../../typechain'
import { CVX3CRV } from '../../../../shared/constants'
import { addTokenProposal } from '../../../fragments/ladle/addTokenProposal'
import { replaceJoinProposal } from '../../../fragments/assetsAndSeries/replaceJoinProposal'
import { addIntegrationProposal } from '../../../fragments/ladle/addIntegrationProposal'

const { developer, deployer, assets } = require(process.env.CONF as string)
const { compositeDebtLimits, compositeAuctionLimits, seriesIlks } = require(process.env.CONF as string)

/**
 * @dev This script orchestrates joins, adds assets to the Cauldron, and makes them into ilks
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const protocol = readAddressMappingIfExists('protocol.json')
  const governance = readAddressMappingIfExists('governance.json')
  const joins = readAddressMappingIfExists('newJoins.json')
  
  const ladle = (await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as unknown as Ladle
  
  const cloak = (await ethers.getContractAt(
    'EmergencyBrake',
    governance.get('cloak') as string,
    ownerAcc
  )) as unknown as EmergencyBrake
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  let assetsAndJoins: [string, string, string][] = []
  // console.log(` AssetId      | Asset Address                            | Join Address`)
  let tableData = []
  for (let [assetId, joinAddress] of joins) {
    assetsAndJoins.push([assetId, assets.get(assetId) as string, joinAddress])
    // console.log(`${[assetId, assets.get(assetId) as string, joinAddress]}`)
    tableData.push({ AssetId: assetId, 'Asset Address': assets.get(assetId) as string, 'Join Address': joinAddress })
  }
  console.table(tableData)
  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await replaceJoinProposal(ownerAcc, deployer, ladle, timelock, cloak, assetsAndJoins))
  proposal = proposal.concat(await addIntegrationProposal(ladle,joins.get(CVX3CRV) as string))
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
  
})()

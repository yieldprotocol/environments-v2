import { ethers } from 'hardhat'
import {
  readAddressMappingIfExists,
  proposeApproveExecute,
  getOwnerOrImpersonate,
} from '../../../../../../shared/helpers'

import { orchestrateJoinProposal } from '../../../../../fragments/core/removeDeployerRootToCloak'
import { addAssetProposal } from '../../../../../fragments/assetsAndSeries/addAsset'
import { makeIlkProposal } from '../../../../../fragments/assetsAndSeries/makeIlk'
import { addIlksToSeriesProposal } from '../../../../../fragments/assetsAndSeries/addIlkToSeries'

import {
  IOracle,
  CompositeMultiOracle,
  CompoundMultiOracle,
  Cauldron,
  Ladle,
  Witch,
  Timelock,
  EmergencyBrake,
  Cvx3CrvOracle,
} from '../../../../../../typechain'
import { CONVEX3CRV, CVX3CRV } from '../../../../../../shared/constants'
import { addTokenProposal } from '../../../../../fragments/ladle/addToken'
import { addIntegrationProposal } from '../../../../../fragments/ladle/addIntegration'
import { addModuleProposal } from '../../../../../fragments/ladle/addModule'
import { orchestrateCvx3CrvOracleProposal } from '../../../../../fragments/oracles/orchestrateCvx3CrvOracle'
import { updateCompositePathsProposal } from '../../../../../fragments/oracles/updateCompositePaths'
import { updateCompositeSourcesProposal } from '../../../../../fragments/oracles/updateCompositeSources'
import { updateCvx3CrvOracleSourcesProposal } from '../../../../../fragments/oracles/updateCvx3CrvOracleSources'
import { removeLadlePermissionsProposal } from './removeLadlePermissionsProposal'

const { developer, deployer, assets } = require(process.env.CONF as string)
const {
  compositeDebtLimits,
  compositeAuctionLimits,
  seriesIlks,
  cvx3CrvSources,
  compositeSources,
  compositePaths,
} = require(process.env.CONF as string)

/**
 * @dev This script orchestrates joins, adds assets to the Cauldron, and makes them into ilks
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const protocol = readAddressMappingIfExists('protocol.json')
  const governance = readAddressMappingIfExists('governance.json')
  const joins = readAddressMappingIfExists('newJoins.json')
  const compositeOracle = (await ethers.getContractAt(
    'CompositeMultiOracle',
    protocol.get('compositeOracle') as string,
    ownerAcc
  )) as unknown as CompositeMultiOracle
  const compoundOracle = (await ethers.getContractAt(
    'CompoundMultiOracle',
    protocol.get('compoundOracle') as string,
    ownerAcc
  )) as unknown as CompoundMultiOracle
  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron
  const ladle = (await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as unknown as Ladle
  const witch = (await ethers.getContractAt('Witch', protocol.get('witch') as string, ownerAcc)) as unknown as Witch
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
  const cvx3CrvOracle = (await ethers.getContractAt(
    'Cvx3CrvOracle',
    protocol.get(CONVEX3CRV) as string,
    ownerAcc
  )) as unknown as Cvx3CrvOracle
  let assetsAndJoins: [string, string, string][] = []
  // console.log(` AssetId      | Asset Address                            | Join Address`)
  let tableData = []
  for (let [assetId, joinAddress] of joins) {
    assetsAndJoins.push([assetId, assets.get(assetId) as string, joinAddress])
    // console.log(`${[assetId, assets.get(assetId) as string, joinAddress]}`)
    tableData.push({ AssetId: assetId, 'Asset Address': assets.get(assetId) as string, 'Join Address': joinAddress })
  }
  console.table(tableData)

  const convexLadleModuleAddress: string = protocol.get('convexLadleModule') as string

  let proposal: Array<{ target: string; data: string }> = []

  proposal = proposal.concat(await orchestrateCvx3CrvOracleProposal(ownerAcc.address, cvx3CrvOracle, timelock, cloak))
  proposal = proposal.concat(await updateCvx3CrvOracleSourcesProposal(cvx3CrvOracle, cvx3CrvSources))
  proposal = proposal.concat(await updateCompositeSourcesProposal(compositeOracle, compositeSources))
  proposal = proposal.concat(await updateCompositePathsProposal(compositeOracle, compositePaths))

  proposal = proposal.concat(await addModuleProposal(ladle, convexLadleModuleAddress))
  proposal = proposal.concat(await removeLadlePermissionsProposal(cauldron, ladle))

  proposal = proposal.concat(await orchestrateJoinProposal(ownerAcc, deployer, ladle, timelock, cloak, assetsAndJoins))
  proposal = proposal.concat(await addAssetProposal(ownerAcc, cauldron, ladle, assetsAndJoins))
  proposal = proposal.concat(
    await makeIlkProposal(
      ownerAcc,
      compositeOracle as unknown as IOracle,
      cauldron,
      witch,
      cloak,
      joins,
      compositeDebtLimits,
      compositeAuctionLimits
    )
  )
  proposal = proposal.concat(await addIlksToSeriesProposal(cauldron, seriesIlks))
  proposal = proposal.concat(await addTokenProposal(ladle, assets.get(CVX3CRV) as string))
  proposal = proposal.concat(await addIntegrationProposal(ladle, joins.get(CVX3CRV) as string))
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()

import { ethers } from 'hardhat'
import {
  getOriginalChainId,
  readAddressMappingIfExists,
  proposeApproveExecute,
  getOwnerOrImpersonate,
} from '../../../../../shared/helpers'

import { EULER } from '../../../../../shared/constants'

import { orchestrateJoinProposal } from '../../../../fragments/assetsAndSeries/orchestrateJoinProposal'
import { addAssetProposal } from '../../../../fragments/assetsAndSeries/addAssetProposal'
import { makeIlkProposal } from '../../../../fragments/assetsAndSeries/makeIlkProposal'
import { addIlksToSeriesProposal } from '../../../../fragments/assetsAndSeries/addIlksToSeriesProposal'

import {
  IOracle,
  Cauldron,
  Ladle,
  Timelock,
  EmergencyBrake,
  ETokenMultiOracle,
  WitchOld,
} from '../../../../../typechain'
import { orchestrateEulerOracleProposal } from '../../../../fragments/oracles/orchestrateEulerOracleProposal'
import { updateEulerSourcesProposal } from '../../../../fragments/oracles/updateEulerSourcesProposal'

const { developer, deployer, auctionLimits, debtLimits, seriesIlks, assets, eulerSources } = require(process.env
  .CONF as string)

/**
 * @dev This script configures the Yield Protocol to use eToken as collateral.
 */
;(async () => {
  const chainId = await getOriginalChainId()

  let ownerAcc = await getOwnerOrImpersonate(developer)

  const protocol = readAddressMappingIfExists('protocol.json')
  const joins = readAddressMappingIfExists('newJoins.json')
  const governance = readAddressMappingIfExists('governance.json')

  const eulerOracle = (await ethers.getContractAt(
    'ETokenMultiOracle',
    protocol.get(EULER) as string
  )) as unknown as ETokenMultiOracle
  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron
  const ladle = (await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as unknown as Ladle
  const witch = (await ethers.getContractAt(
    'WitchOld',
    protocol.get('witch') as string,
    ownerAcc
  )) as unknown as WitchOld
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

  let assetsAndJoins: Array<[string, string, string]> = []
  for (let [assetId, joinAddress] of joins) {
    assetsAndJoins.push([assetId, assets.get(assetId) as string, joinAddress])
    console.log(`Using ${assets.get(assetId) as string} as Join for ${joinAddress}`)
  }

  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await orchestrateEulerOracleProposal(deployer, eulerOracle, timelock, cloak))
  proposal = proposal.concat(await orchestrateJoinProposal(ownerAcc, deployer, ladle, timelock, cloak, assetsAndJoins))
  proposal = proposal.concat(await updateEulerSourcesProposal(eulerOracle, eulerSources))
  proposal = proposal.concat(await addAssetProposal(ownerAcc, cauldron, ladle, assetsAndJoins))
  proposal = proposal.concat(
    await makeIlkProposal(
      ownerAcc,
      eulerOracle as unknown as IOracle,
      cauldron,
      witch,
      cloak,
      joins,
      debtLimits,
      auctionLimits
    )
  )
  proposal = proposal.concat(await addIlksToSeriesProposal(cauldron, seriesIlks))

  await proposeApproveExecute(timelock, proposal, governance.get('multisig')!, developer)
})()

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

  let assetsAndJoins: [string, string, string][] = []
  console.log(` AssetId      | Asset Address                            | Join Address`)

  for (let [assetId, joinAddress] of joins) {
    assetsAndJoins.push([assetId, assets.get(assetId) as string, joinAddress])
    console.log(`${[assetId, assets.get(assetId) as string, joinAddress]}`)
  }

  let proposal: Array<{ target: string; data: string }> = []
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
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()

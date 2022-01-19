import { ethers } from 'hardhat'
import { getOriginalChainId, readAddressMappingIfExists, proposeApproveExecute, getOwnerOrImpersonate } from '../../../shared/helpers'

import { orchestrateJoinProposal } from '../../fragments/assetsAndSeries/orchestrateJoinProposal'
// import { updateChainlinkSourcesProposal } from '../../fragments/oracles/updateChainlinkSourcesProposal'
import { addAssetProposal } from '../../fragments/assetsAndSeries/addAssetProposal'
import { makeIlkProposal } from '../../fragments/assetsAndSeries/makeIlkProposal'
import { makeBaseProposal } from '../../fragments/assetsAndSeries/makeBaseProposal'

import { IOracle, ChainlinkMultiOracle, CompositeMultiOracle, YearnVaultMultiOracle, CompoundMultiOracle } from '../../../typechain'
import { Cauldron, Ladle, Witch, Timelock, EmergencyBrake } from '../../../typechain'
import { developer, deployer, assets, bases } from './newEnvironment.rinkeby.config'
import { chainlinkDebtLimits, compositeDebtLimits, yearnDebtLimits, chainlinkAuctionLimits, compositeAuctionLimits, yearnAuctionLimits } from './newEnvironment.rinkeby.config'

/**
 * @dev This script orchestrates joins, adds assets to the Cauldron, and makes them into ilks and bases accordingly
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (!(chainId === 1 || chainId === 4 || chainId === 42)) throw "Only Kovan, Rinkeby and Mainnet supported"

  let ownerAcc = await getOwnerOrImpersonate(developer)

  const protocol = readAddressMappingIfExists('protocol.json');
  const governance = readAddressMappingIfExists('governance.json');
  const joins = readAddressMappingIfExists('joins.json');

  const chainlinkOracle = (await ethers.getContractAt(
    'ChainlinkMultiOracle',
    protocol.get('chainlinkOracle') as string,
    ownerAcc
  )) as unknown as ChainlinkMultiOracle
  const compositeOracle = (await ethers.getContractAt(
    'CompositeMultiOracle',
    protocol.get('compositeOracle') as string,
    ownerAcc
  )) as unknown as CompositeMultiOracle
  const yearnOracle = (await ethers.getContractAt(
    'YearnVaultMultiOracle',
    protocol.get('yearnOracle') as string,
    ownerAcc
  )) as unknown as YearnVaultMultiOracle
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
  const ladle = (await ethers.getContractAt(
    'Ladle',
    protocol.get('ladle') as string,
    ownerAcc
  )) as unknown as Ladle
  const witch = (await ethers.getContractAt(
    'Witch',
    protocol.get('witch') as string,
    ownerAcc
  )) as unknown as Witch
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
  proposal = proposal.concat(await makeIlkProposal(
    ownerAcc,
    chainlinkOracle as unknown as IOracle,
    cauldron,
    witch,
    cloak,
    joins,
    chainlinkDebtLimits,
    chainlinkAuctionLimits
  ))
  proposal = proposal.concat(await makeIlkProposal(
    ownerAcc,
    compositeOracle as unknown as IOracle,
    cauldron,
    witch,
    cloak,
    joins,
    compositeDebtLimits,
    compositeAuctionLimits
  ))
  proposal = proposal.concat(await makeIlkProposal(
    ownerAcc,
    yearnOracle as unknown as IOracle,
    cauldron,
    witch,
    cloak,
    joins,
    yearnDebtLimits,
    yearnAuctionLimits
  ))
  proposal = proposal.concat(await makeBaseProposal(
    ownerAcc,
    compoundOracle as unknown as IOracle,
    cauldron,
    ladle,
    witch,
    cloak,
    bases
  ))

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()

import { ethers } from 'hardhat'
import {
  getOriginalChainId,
  readAddressMappingIfExists,
  proposeApproveExecute,
  getOwnerOrImpersonate,
} from '../../../../shared/helpers'

import { YEARN } from '../../../../shared/constants'

import { orchestrateJoinProposal } from '../../../fragments/assetsAndSeries/orchestrateJoinProposal'
import { updateYearnSourcesProposal } from '../../../fragments/oracles/updateYearnSourcesProposal'
import { addAssetProposal } from '../../../fragments/assetsAndSeries/addAssetProposal'
import { makeIlkProposal } from '../../../fragments/assetsAndSeries/makeIlkProposal'
import { addIlksToSeriesProposal } from '../../../fragments/assetsAndSeries/addIlksToSeriesProposal'

import { IOracle, YearnVaultMultiOracle, Cauldron, Ladle, Witch, Timelock, EmergencyBrake } from '../../../../typechain'

import {
  developer,
  deployer,
  yearnSources,
  assets,
  debtLimits,
  auctionLimits,
  seriesIlks,
} from './addYVUSDC.rinkeby.config'

/**
 * @dev This script configures the Yield Protocol to use a YearnVault token as collateral.
 */
;(async () => {
  const chainId = await getOriginalChainId()

  let ownerAcc = await getOwnerOrImpersonate(developer)

  const protocol = readAddressMappingIfExists('protocol.json')
  const joins = readAddressMappingIfExists('joins.json')
  const governance = readAddressMappingIfExists('governance.json')

  const yearnOracle = (await ethers.getContractAt(
    'YearnVaultMultiOracle',
    protocol.get(YEARN) as string
  )) as unknown as YearnVaultMultiOracle
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

  let assetsAndJoins: Array<[string, string, string]> = []
  for (let [assetId, joinAddress] of joins) {
    assetsAndJoins.push([assetId, assets.get(assetId) as string, joinAddress])
    console.log(`${[assetId, assets.get(assetId) as string, joinAddress]}`)
  }

  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await orchestrateJoinProposal(ownerAcc, deployer, ladle, timelock, cloak, assetsAndJoins))
  proposal = proposal.concat(await updateYearnSourcesProposal(yearnOracle, yearnSources))
  proposal = proposal.concat(await addAssetProposal(ownerAcc, cauldron, ladle, assetsAndJoins))
  proposal = proposal.concat(
    await makeIlkProposal(
      ownerAcc,
      yearnOracle as unknown as IOracle,
      cauldron,
      witch,
      cloak,
      joins,
      debtLimits,
      auctionLimits
    )
  )
  proposal = proposal.concat(await addIlksToSeriesProposal(cauldron, seriesIlks))

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()

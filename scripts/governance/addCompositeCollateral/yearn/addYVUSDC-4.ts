import { ethers } from 'hardhat'
import { readAddressMappingIfExists, proposeApproveExecute, getOwnerOrImpersonate, getOriginalChainId } from '../../../../shared/helpers'

import { orchestrateAddedAssetProposal } from '../../../fragments/assetsAndSeries/orchestrateAddedAssetProposal'
import { makeIlkProposal } from '../../../fragments/assetsAndSeries/makeIlkProposal'
import { addIlksToSeriesProposal } from '../../../fragments/assetsAndSeries/addIlksToSeriesProposal'
import { IOracle, Cauldron, Ladle, Witch, Wand, Timelock, EmergencyBrake } from '../../../../typechain'
import { WAD } from '../../../../shared/constants'
import { developer } from './addYVUSDC.rinkeby.config'
import { assetsToAdd, compositeLimits, seriesIlks } from './addYVUSDC.rinkeby.config'
 
/**
 * @dev This script adds YVUSDC as an ilk to the Yield Protocol
 * Previously, the YearnOracle should have been deployed, and ROOT access
 * given to the Timelock. YVUSDC should also have been added as an asset to the Protocol.
 * Deploy the YearnOracle
 * Configure the permissions for the Yearn Oracle
 * Add the YVUSDC/USDC yvToken as the YVUSDC/USDC source in the Yearn Oracle
 * Add the Yearn Oracle as the YVUSDC/USDC source in the Composite Oracle
 * Add the Chainlink Oracle as the DAI/USDC and ETH/USDC sources in the Composite Oracle
 * Add the DAI/USDC/YVUSDC and ETH/USDC/YVUSDC paths in the Composite Oracle
 * Add YVUSDC as an asset to the Yield Protocol using the Wand
 * --- You are here ---
 * Permission the YVUSDCJoin
 * Make YVUSDC into an Ilk
 * Approve YVUSDC as collateral for all series
 */
 
 ;(async () => {
   const chainId = await getOriginalChainId()
   if (!(chainId === 1 || chainId === 4 || chainId === 42)) throw "Only Kovan, Rinkeby and Mainnet supported"
 
   let ownerAcc = await getOwnerOrImpersonate(developer, WAD)
 
   const governance = readAddressMappingIfExists('governance.json');
   const protocol = readAddressMappingIfExists('protocol.json');

  const compositeOracle = ((await ethers.getContractAt(
    'IOracle',
    protocol.get('compositeOracle') as string,
    ownerAcc
  )) as unknown) as IOracle
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
  const wand = (await ethers.getContractAt(
    'Wand',
    protocol.get('wand') as string,
    ownerAcc
  )) as unknown as Wand
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

  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await orchestrateAddedAssetProposal(ownerAcc, ladle, timelock, cloak, assetsToAdd))
  proposal = proposal.concat(await makeIlkProposal(ownerAcc, compositeOracle, ladle, witch, wand, cloak, compositeLimits))
  proposal = proposal.concat(await addIlksToSeriesProposal(cauldron, seriesIlks))

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()

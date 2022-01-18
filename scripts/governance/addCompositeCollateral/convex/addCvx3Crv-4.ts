import { ethers } from 'hardhat'
import {
  readAddressMappingIfExists,
  proposeApproveExecute,
  getOwnerOrImpersonate,
  getOriginalChainId,
} from '../../../../shared/helpers'

import { orchestrateAddedAssetProposal } from '../../../fragments/assetsAndSeries/orchestrateAddedAssetProposal'
import { makeIlkProposal } from '../../../fragments/assetsAndSeries/makeIlkProposal'
import { addIlksToSeriesProposal } from '../../../fragments/assetsAndSeries/addIlksToSeriesProposal'

import { IOracle, Cauldron, Ladle, Witch, Wand, Timelock, EmergencyBrake } from '../../../../typechain'

import { developer, compositeLimits, seriesIlks } from './addCvx3Crv.config'

/**
 * @dev This script adds ENS as an ilk to the Yield Protocol
 * Previously, the Cvx3crvOracle should have been deployed, and ROOT access
 * given to the Timelock.
 * Deploy the Cvx3crv oracle
 * Configure the permissions for the Cvx3crv Oracle
 * Add the Cvx3crv Oracle as the CVX3CRV/ETH source in the Composite Oracle
 * Add the Chainlink Oracle as the DAI/ETH and USDC/ETH sources in the Composite Oracle
 * Add the DAI/CVX3CRV/ETH and USDC/CVX3CRV/ETH paths in the Composite Oracle
 * --- You are here ---
 * Permission the Cvx3CrvJoin
 * Make Cvx3Crv into an Ilk
 * Approve Cvx3Crv as collateral for all series
 */
import { CVX3CRV } from '../../../../shared/constants'
;(async () => {
  const chainId = await getOriginalChainId()
  if (!(chainId === 1 || chainId === 4 || chainId === 42)) throw 'Only Kovan, Rinkeby and Mainnet supported'

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string)

  const governance = readAddressMappingIfExists('governance.json')
  const protocol = readAddressMappingIfExists('protocol.json')
  const convexYieldWrapperAddress: string = protocol.get('convexYieldWrapper') as string

  const compositeOracle = (await ethers.getContractAt(
    'IOracle',
    protocol.get('compositeOracle') as string,
    ownerAcc
  )) as unknown as IOracle
  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron
  const ladle = (await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as unknown as Ladle
  const witch = (await ethers.getContractAt('Witch', protocol.get('witch') as string, ownerAcc)) as unknown as Witch
  const wand = (await ethers.getContractAt('Wand', protocol.get('wand') as string, ownerAcc)) as unknown as Wand
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
  proposal = proposal.concat(
    await orchestrateAddedAssetProposal(ownerAcc, ladle, timelock, cloak, [[CVX3CRV, convexYieldWrapperAddress]])
  )
  proposal = proposal.concat(
    await makeIlkProposal(ownerAcc, compositeOracle, ladle, witch, wand, cloak, compositeLimits)
  )
  proposal = proposal.concat(await addIlksToSeriesProposal(cauldron, seriesIlks))

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()

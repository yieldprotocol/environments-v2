import { ethers } from 'hardhat'
import { readAddressMappingIfExists, getOwnerOrImpersonate, getOriginalChainId, proposeApproveExecute } from '../../../../shared/helpers'

import { updateChiSourcesProposal } from '../../../fragments/oracles/updateChiSourcesProposal'
import { updateRateSourcesProposal } from '../../../fragments/oracles/updateRateSourcesProposal'
import { updateCompositePathsProposal } from '../../../fragments/oracles/updateCompositePathsProposal'
import { makeBaseProposal } from '../../../fragments/assetsAndSeries/makeBaseProposal'
import { makeIlkProposal } from '../../../fragments/assetsAndSeries/makeIlkProposal'
import { addSeriesProposal } from '../../../fragments/assetsAndSeries/addSeriesProposal'

import { IOracle, CompoundMultiOracle, CompositeMultiOracle, Ladle, Witch, Wand, EmergencyBrake, Timelock } from '../../../../typechain'
import { COMPOUND, CHAINLINK, COMPOSITE, UNISWAP } from '../../../../shared/constants'
import { developer, newChiSources, newRateSources, newCompositePaths, newBases, newChainlinkLimits, newCompositeLimits, newUniswapLimits, newSeries } from './addEthSeries.config'

/**
 * @dev This script deploys two strategies to be used for Ether
 */

;(async () => {
  const chainId = await getOriginalChainId()

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string)

  const protocol = readAddressMappingIfExists('protocol.json');
  const governance = readAddressMappingIfExists('governance.json');

  const ladle = (await ethers.getContractAt(
    'Ladle',
    protocol.get('ladle') as string,
    ownerAcc
  )) as unknown as Ladle
  const compoundOracle = (await ethers.getContractAt(
    'CompoundMultiOracle',
    protocol.get(COMPOUND) as string,
    ownerAcc
  )) as unknown as CompoundMultiOracle
  const chainlinkOracle = (await ethers.getContractAt(
    'IOracle',
    protocol.get(CHAINLINK) as string,
    ownerAcc
  )) as unknown as IOracle
  const uniswapOracle = (await ethers.getContractAt(
    'IOracle',
    protocol.get(UNISWAP) as string,
    ownerAcc
  )) as unknown as IOracle
  const compositeOracle = (await ethers.getContractAt(
    'CompositeMultiOracle',
    protocol.get(COMPOSITE) as string,
    ownerAcc
  )) as unknown as CompositeMultiOracle
  const wand = (await ethers.getContractAt(
    'Wand',
    protocol.get('wand') as string,
    ownerAcc
  )) as unknown as Wand
  const witch = (await ethers.getContractAt(
    'Witch',
    protocol.get('witch') as string,
    ownerAcc
  )) as unknown as Witch
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock
  const cloak = (await ethers.getContractAt(
    'EmergencyBrake',
    governance.get('cloak') as string,
    ownerAcc
  )) as unknown as EmergencyBrake


  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await updateChiSourcesProposal(compoundOracle, newChiSources.get(chainId) as [string, string][]))
  proposal = proposal.concat(await updateRateSourcesProposal(compoundOracle, newRateSources.get(chainId) as [string, string][]))
  proposal = proposal.concat(await updateCompositePathsProposal(compositeOracle, newCompositePaths))
  proposal = proposal.concat(await makeBaseProposal(ownerAcc, compoundOracle as unknown as IOracle, ladle, witch, wand, cloak, newBases))
  proposal = proposal.concat(await makeIlkProposal(ownerAcc, chainlinkOracle, ladle, witch, wand, cloak, newChainlinkLimits.get(chainId) as [string, string, string, number, number, number, number, number][]))
  if (chainId === 1)  proposal = proposal.concat(await makeIlkProposal(ownerAcc, uniswapOracle, ladle, witch, wand, cloak, newUniswapLimits.get(chainId) as [string, string, string, number, number, number, number, number][]))
  proposal = proposal.concat(await makeIlkProposal(ownerAcc, compositeOracle as unknown as IOracle, ladle, witch, wand, cloak, newCompositeLimits))
  proposal = proposal.concat(await addSeriesProposal(wand, newSeries))

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()

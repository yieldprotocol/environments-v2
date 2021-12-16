import { ethers } from 'hardhat'
import * as fs from 'fs'
import { readAddressMappingIfExists, proposeApproveExecute, getOwnerOrImpersonate, getOriginalChainId } from '../../../shared/helpers'

import { orchestrateChainlinkOracleProposal } from '../../fragments/oracles/orchestrateChainlinkOracleProposal'
import { orchestrateCompoundOracleProposal } from '../../fragments/oracles/orchestrateCompoundOracleProposal'
import { orchestrateCompositeOracleProposal } from '../../fragments/oracles/orchestrateCompositeOracleProposal'
import { orchestrateUniswapOracleProposal } from '../../fragments/oracles/orchestrateUniswapOracleProposal'
import { orchestrateLidoOracleProposal } from '../../fragments/oracles/orchestrateLidoOracleProposal'
import { updateChiSourcesProposal } from '../../fragments/oracles/updateChiSourcesProposal'
import { updateRateSourcesProposal } from '../../fragments/oracles/updateRateSourcesProposal'
import { updateChainlinkSourcesProposal } from '../../fragments/oracles/updateChainlinkSourcesProposal'
import { updateUniswapSourcesProposal } from '../../fragments/oracles/updateUniswapSourcesProposal'
import { updateLidoSourceProposal } from '../../fragments/oracles/updateLidoSourceProposal'
import { updateCompositeSourcesProposal } from '../../fragments/oracles/updateCompositeSourcesProposal'
import { updateCompositePathsProposal } from '../../fragments/oracles/updateCompositePathsProposal'

import { Timelock, EmergencyBrake } from '../../../typechain'
import { ChainlinkMultiOracle, CompoundMultiOracle, CompositeMultiOracle, UniswapV3Oracle, LidoOracle } from '../../../typechain'
import { WAD } from '../../../shared/constants'
import { deployer, developer } from './newEnvironment.rinkeby.config'
import { chainlinkSources, chiSources, rateSources, uniswapSources, lidoSource, compositeSources, compositePaths } from './newEnvironment.rinkeby.config'

/**
 * @dev This script sets up the oracles
 */

;(async () => {
  const chainId = await getOriginalChainId()

  let ownerAcc = await getOwnerOrImpersonate(developer as string)
  const governance = readAddressMappingIfExists('governance.json');
  const protocol = readAddressMappingIfExists('protocol.json');

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

  const chainlinkOracle = ((await ethers.getContractAt(
    'ChainlinkMultiOracle',
    protocol.get('chainlinkOracle') as string,
    ownerAcc
  )) as unknown) as ChainlinkMultiOracle
  const compoundOracle = ((await ethers.getContractAt(
    'CompoundMultiOracle',
    protocol.get('compoundOracle') as string,
    ownerAcc
  )) as unknown) as CompoundMultiOracle
  const compositeOracle = ((await ethers.getContractAt(
    'CompositeMultiOracle',
    protocol.get('compositeOracle') as string,
    ownerAcc
  )) as unknown) as CompositeMultiOracle
  const uniswapOracle = ((await ethers.getContractAt(
    'UniswapV3Oracle',
    protocol.get('uniswapOracle') as string,
    ownerAcc
  )) as unknown) as UniswapV3Oracle
  const lidoOracle = ((await ethers.getContractAt(
    'LidoOracle',
    protocol.get('lidoOracle') as string,
    ownerAcc
  )) as unknown) as LidoOracle

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await orchestrateChainlinkOracleProposal(deployer as string, chainlinkOracle, timelock, cloak))
  proposal = proposal.concat(await orchestrateCompoundOracleProposal(deployer as string, compoundOracle, timelock, cloak))
  proposal = proposal.concat(await orchestrateCompositeOracleProposal(deployer as string, compositeOracle, timelock, cloak))
  proposal = proposal.concat(await orchestrateUniswapOracleProposal(deployer as string, uniswapOracle, timelock, cloak))
  proposal = proposal.concat(await orchestrateLidoOracleProposal(deployer as string, lidoOracle, timelock, cloak))
  proposal = proposal.concat(await updateChiSourcesProposal(compoundOracle, chiSources as [string, string][]))
  proposal = proposal.concat(await updateRateSourcesProposal(compoundOracle, rateSources as [string, string][]))
  proposal = proposal.concat(await updateChainlinkSourcesProposal(chainlinkOracle, chainlinkSources as [string, string, string, string, string][]))
  proposal = proposal.concat(await updateUniswapSourcesProposal(uniswapOracle, uniswapSources as [string, string, string, number][]))
  proposal = proposal.concat(await updateLidoSourceProposal(lidoOracle, lidoSource as string))
  proposal = proposal.concat(await updateCompositeSourcesProposal(compositeOracle, compositeSources as [string, string, string][]))
  proposal = proposal.concat(await updateCompositePathsProposal(compositeOracle, compositePaths as [string, string, string[]][]))

  // Propose, Approve & execute
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()

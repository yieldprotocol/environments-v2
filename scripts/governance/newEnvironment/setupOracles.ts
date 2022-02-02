import { ethers } from 'hardhat'
import * as fs from 'fs'
import { readAddressMappingIfExists, proposeApproveExecute, getOwnerOrImpersonate, getOriginalChainId } from '../../../shared/helpers'

import { orchestrateChainlinkOracleProposal } from '../../fragments/oracles/orchestrateChainlinkOracleProposal'
import { orchestrateCompoundOracleProposal } from '../../fragments/oracles/orchestrateCompoundOracleProposal'
import { orchestrateCompositeOracleProposal } from '../../fragments/oracles/orchestrateCompositeOracleProposal'
import { orchestrateUniswapOracleProposal } from '../../fragments/oracles/orchestrateUniswapOracleProposal'
import { orchestrateYearnOracleProposal } from '../../fragments/oracles/orchestrateYearnOracleProposal'
import { orchestrateLidoOracleProposal } from '../../fragments/oracles/orchestrateLidoOracleProposal'
import { updateChiSourcesProposal } from '../../fragments/oracles/updateChiSourcesProposal'
import { updateRateSourcesProposal } from '../../fragments/oracles/updateRateSourcesProposal'
import { updateChainlinkSourcesProposal } from '../../fragments/oracles/updateChainlinkSourcesProposal'
import { updateUniswapSourcesProposal } from '../../fragments/oracles/updateUniswapSourcesProposal'
import { updateLidoSourceProposal } from '../../fragments/oracles/updateLidoSourceProposal'
import { updateYearnSourcesProposal } from '../../fragments/oracles/updateYearnSourcesProposal'
import { updateCompositeSourcesProposal } from '../../fragments/oracles/updateCompositeSourcesProposal'
import { updateCompositePathsProposal } from '../../fragments/oracles/updateCompositePathsProposal'

import { Timelock, EmergencyBrake } from '../../../typechain'
import { ChainlinkMultiOracle, CompoundMultiOracle, CompositeMultiOracle, UniswapV3Oracle, LidoOracle, YearnVaultMultiOracle } from '../../../typechain'
import { WAD } from '../../../shared/constants'
const { deployer, developer } = require(process.env.CONF as string)
const { chainlinkSources, chiSources, rateSources, uniswapSources, lidoSource, compositeSources, compositePaths, yearnSources } = require(process.env.CONF as string)

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
  const yearnOracle = ((await ethers.getContractAt(
    'YearnVaultMultiOracle',
    protocol.get('yearnOracle') as string,
    ownerAcc
  )) as unknown) as YearnVaultMultiOracle

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await orchestrateChainlinkOracleProposal(deployer, chainlinkOracle, timelock, cloak))
  proposal = proposal.concat(await orchestrateCompoundOracleProposal(deployer, compoundOracle, timelock, cloak))
  proposal = proposal.concat(await orchestrateCompositeOracleProposal(deployer, compositeOracle, timelock, cloak))
  proposal = proposal.concat(await orchestrateUniswapOracleProposal(deployer, uniswapOracle, timelock, cloak))
  proposal = proposal.concat(await orchestrateYearnOracleProposal(deployer, yearnOracle, timelock, cloak))
  proposal = proposal.concat(await orchestrateLidoOracleProposal(deployer, lidoOracle, timelock, cloak))
  proposal = proposal.concat(await updateChiSourcesProposal(compoundOracle, chiSources))
  proposal = proposal.concat(await updateRateSourcesProposal(compoundOracle, rateSources))
  proposal = proposal.concat(await updateChainlinkSourcesProposal(chainlinkOracle, chainlinkSources))
  proposal = proposal.concat(await updateUniswapSourcesProposal(uniswapOracle, uniswapSources))
  proposal = proposal.concat(await updateYearnSourcesProposal(yearnOracle, yearnSources))
  proposal = proposal.concat(await updateLidoSourceProposal(lidoOracle, lidoSource))
  proposal = proposal.concat(await updateCompositeSourcesProposal(compositeOracle, compositeSources))
  proposal = proposal.concat(await updateCompositePathsProposal(compositeOracle, compositePaths))

  // Propose, Approve & execute
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()

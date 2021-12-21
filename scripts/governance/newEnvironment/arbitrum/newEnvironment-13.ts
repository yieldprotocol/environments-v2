import { ethers } from 'hardhat'
import { readAddressMappingIfExists, proposeApproveExecute, getOwnerOrImpersonate, getOriginalChainId } from '../../../../shared/helpers'

import { orchestrateChainlinkUSDOracleProposal } from '../../../fragments/oracles/orchestrateChainlinkUSDOracleProposal'
import { orchestrateAccumulatorOracleProposal } from '../../../fragments/oracles/orchestrateAccumulatorOracleProposal'
import { updateAccumulatorSourcesProposal } from '../../../fragments/oracles/updateAccumulatorSourcesProposal'
import { updateChainlinkUSDSourcesProposal } from '../../../fragments/oracles/updateChainlinkUSDSourcesProposal'

import { Timelock, EmergencyBrake } from '../../../../typechain'
import { ChainlinkUSDMultiOracle, AccumulatorMultiOracle } from '../../../../typechain'
import { CHAINLINKUSD, ACCUMULATOR } from '../../../../shared/constants'
import { deployer, developer } from './../newEnvironment.arb_rinkeby.config'
import { chainlinkUSDSources, rateChiSources } from './../newEnvironment.arb_rinkeby.config'

/**
 * @dev This script orchestratese the Cloak
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

  const chainlinkUSDOracle = ((await ethers.getContractAt(
    'ChainlinkUSDMultiOracle',
    protocol.get(CHAINLINKUSD) as string,
    ownerAcc
  )) as unknown) as ChainlinkUSDMultiOracle
  const accumulatorOracle = ((await ethers.getContractAt(
    'AccumulatorMultiOracle',
    protocol.get(ACCUMULATOR) as string,
    ownerAcc
  )) as unknown) as AccumulatorMultiOracle

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await orchestrateChainlinkUSDOracleProposal(deployer as string, chainlinkUSDOracle, timelock, cloak))
  proposal = proposal.concat(await orchestrateAccumulatorOracleProposal(deployer as string, accumulatorOracle, timelock, cloak))
  proposal = proposal.concat(await updateAccumulatorSourcesProposal(accumulatorOracle, rateChiSources as [string, string, string, string][]))
  proposal = proposal.concat(await updateChainlinkUSDSourcesProposal(chainlinkUSDOracle, chainlinkUSDSources as [string, string, string][]))

  // Propose, Approve & execute
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
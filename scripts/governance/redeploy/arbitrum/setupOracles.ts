import { ethers } from 'hardhat'
import { proposeApproveExecute, getOwnerOrImpersonate } from '../../../../shared/helpers'
import { orchestrateChainlinkUSDOracleProposal } from '../../../fragments/oracles/orchestrateChainlinkUSDOracleProposal'
import { orchestrateAccumulatorOracleProposal } from '../../../fragments/oracles/orchestrateAccumulatorOracleProposal'
import { updateAccumulatorSourcesProposal } from '../../../fragments/oracles/updateAccumulatorSourcesProposal'
import { updateChainlinkUSDSourcesProposal } from '../../../fragments/oracles/updateChainlinkUSDSourcesProposal'
import { CHAINLINKUSD, ACCUMULATOR } from '../../../../shared/constants'
const { deployer, developer, governance, protocol } = require(process.env.CONF as string)
const { chainlinkUSDSources, rateChiSources } = require(process.env.CONF as string)

/**
 * @dev This script sets up the oracles
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)

  const cloak = await ethers.getContractAt('EmergencyBrake', governance.get('cloak') as string, ownerAcc)
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc)

  const chainlinkUSDOracle = await ethers.getContractAt(
    'ChainlinkUSDMultiOracle',
    protocol.get(CHAINLINKUSD) as string,
    ownerAcc
  )
  const accumulatorOracle = await ethers.getContractAt(
    'AccumulatorMultiOracle',
    protocol.get(ACCUMULATOR) as string,
    ownerAcc
  )

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await orchestrateChainlinkUSDOracleProposal(deployer, chainlinkUSDOracle, timelock, cloak))
  proposal = proposal.concat(await orchestrateAccumulatorOracleProposal(deployer, accumulatorOracle, timelock, cloak))
  proposal = proposal.concat(await updateAccumulatorSourcesProposal(accumulatorOracle, rateChiSources))
  proposal = proposal.concat(await updateChainlinkUSDSourcesProposal(chainlinkUSDOracle, chainlinkUSDSources))

  // Propose, Approve & execute
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()

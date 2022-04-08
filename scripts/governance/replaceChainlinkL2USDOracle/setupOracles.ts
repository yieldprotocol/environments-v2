import { ethers } from 'hardhat'
import { proposeApproveExecute, getOwnerOrImpersonate } from '../../../shared/helpers'
import { orchestrateChainlinkUSDOracleProposal } from '../../fragments/oracles/orchestrateChainlinkUSDOracleProposal'
import { updateSpotOracleProposal } from '../../fragments/oracles/updateSpotOracleProposal'
import { updateChainlinkUSDSourcesProposal } from '../../fragments/oracles/updateChainlinkUSDSourcesProposal'
import { CHAINLINKUSD } from '../../../shared/constants'
const { deployer, developer } = require(process.env.CONF as string)
const { protocol, governance } = require(process.env.CONF as string)
const { chainlinkUSDSources, assetPairs } = require(process.env.CONF as string)

/**
 * @dev This script sets up a new spotOracle and updates the existingbase/ilk pairs in the Cauldron
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
  const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc)

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await orchestrateChainlinkUSDOracleProposal(deployer, chainlinkUSDOracle, timelock, cloak))
  proposal = proposal.concat(await updateChainlinkUSDSourcesProposal(chainlinkUSDOracle, chainlinkUSDSources))
  proposal = proposal.concat(await updateSpotOracleProposal(ownerAcc, cauldron, assetPairs))

  // Propose, Approve & execute
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()

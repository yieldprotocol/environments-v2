import { ethers } from 'hardhat'
import {
  getOwnerOrImpersonate,
  proposeApproveExecute,
  readAddressMappingIfExists,
} from '../../../../../../../shared/helpers'
import { AccumulatorMultiOracle, ChainlinkUSDMultiOracle, Timelock } from '../../../../../../../typechain'
import { ACCUMULATOR, CHAINLINKUSD } from '../../../../../../../shared/constants'
import { updateAccumulatorSourcesProposal } from '../../../../../../fragments/oracles/updateAccumulatorSourcesProposal'
import { updateChainlinkUSDSourcesProposal } from '../../../../../../fragments/oracles/updateChainlinkUSDSourcesProposal'

const { developer, chainlinkUSDSources, rateChiSources } = require(process.env.CONF as string)

/**
 * @dev This script sets up the oracles
 */
;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)
  const governance = readAddressMappingIfExists('governance.json')
  const protocol = readAddressMappingIfExists('protocol.json')

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  const chainlinkUSDOracle = (await ethers.getContractAt(
    'ChainlinkUSDMultiOracle',
    protocol.get(CHAINLINKUSD) as string,
    ownerAcc
  )) as unknown as ChainlinkUSDMultiOracle
  const accumulatorOracle = (await ethers.getContractAt(
    'AccumulatorMultiOracle',
    protocol.get(ACCUMULATOR) as string,
    ownerAcc
  )) as unknown as AccumulatorMultiOracle

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await updateAccumulatorSourcesProposal(accumulatorOracle, rateChiSources))
  proposal = proposal.concat(await updateChainlinkUSDSourcesProposal(chainlinkUSDOracle, chainlinkUSDSources))

  if (proposal.length > 0) {
    // Propose, Approve & execute
    await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
  }
})()

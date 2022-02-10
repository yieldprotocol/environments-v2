import { ethers } from 'hardhat'
import {
  getOwnerOrImpersonate,
  proposeApproveExecute,
  readAddressMappingIfExists,
} from '../../../../shared/helpers'
import { CompoundMultiOracle, ChainlinkMultiOracle, Timelock } from '../../../../typechain'
import { COMPOUND, CHAINLINK } from '../../../../shared/constants'
import { updateChiSourcesProposal } from '../../../fragments/oracles/updateChiSourcesProposal'
import { updateRateSourcesProposal } from '../../../fragments/oracles/updateRateSourcesProposal'
import { updateChainlinkSourcesProposal } from '../../../fragments/oracles/updateChainlinkSourcesProposal'

const { developer, chainlinkSources, newRateSources, newChiSources } = require(process.env.CONF as string)

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

  const chainlinkOracle = (await ethers.getContractAt(
    'ChainlinkMultiOracle',
    protocol.get(CHAINLINK) as string,
    ownerAcc
  )) as unknown as ChainlinkMultiOracle
  const compoundOracle = (await ethers.getContractAt(
    'CompoundMultiOracle',
    protocol.get(COMPOUND) as string,
    ownerAcc
  )) as unknown as CompoundMultiOracle

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await updateChiSourcesProposal(compoundOracle, newChiSources))
  proposal = proposal.concat(await updateRateSourcesProposal(compoundOracle, newRateSources))
  proposal = proposal.concat(await updateChainlinkSourcesProposal(chainlinkOracle, chainlinkSources))

  if (proposal.length > 0) {
    // Propose, Approve & execute
    await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
  }
})()

import { ethers } from 'hardhat'
import {
  readAddressMappingIfExists,
  getOwnerOrImpersonate,
  getOriginalChainId,
  proposeApproveExecute,
} from '../../../../shared/helpers'

import { orchestrateSeriesProposal } from '../../../fragments/assetsAndSeries/orchestrateSeriesProposal'
import { initPoolsProposal } from '../../../fragments/assetsAndSeries/initPoolsProposal'
import { orchestrateStrategiesProposal } from '../../../fragments/core/strategies/orchestrateStrategiesProposal'
import { initStrategiesProposal } from '../../../fragments/core/strategies/initStrategiesProposal'
import { Cauldron, Ladle, EmergencyBrake, Timelock } from '../../../../typechain'
import { developer, newSeries, poolsInit, newStrategies, strategiesInit } from './addEthSeries.config'

/**
 * @dev This script deploys two strategies to be used for Ether
 */
;(async () => {
  const chainId = await getOriginalChainId()

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string)

  const protocol = readAddressMappingIfExists('protocol.json')
  const governance = readAddressMappingIfExists('governance.json')
  let strategies = readAddressMappingIfExists('strategies.json')

  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron
  const ladle = (await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as unknown as Ladle
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
  proposal = proposal.concat(await orchestrateSeriesProposal(ownerAcc, cauldron, ladle, timelock, cloak, newSeries))
  proposal = proposal.concat(await initPoolsProposal(ownerAcc, ladle, poolsInit))
  proposal = proposal.concat(await orchestrateStrategiesProposal(ownerAcc, strategies, timelock, newStrategies))
  proposal = proposal.concat(await initStrategiesProposal(ownerAcc, strategies, ladle, strategiesInit))

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()

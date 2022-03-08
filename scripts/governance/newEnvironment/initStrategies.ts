import { ethers } from 'hardhat'
import {
  readAddressMappingIfExists,
  getOwnerOrImpersonate,
  getOriginalChainId,
  proposeApproveExecute,
} from '../../../shared/helpers'

import { orchestrateStrategiesProposal } from '../../fragments/core/strategies/orchestrateStrategiesProposal'
import { initStrategiesProposal } from '../../fragments/core/strategies/initStrategiesProposal'
import { Ladle, Timelock } from '../../../typechain'
const { developer, strategiesData, strategiesInit, newStrategies } = require(process.env.CONF as string)

/**
 * @dev This script orchestrates and initializes strategies
 */

;(async () => {
  const chainId = await getOriginalChainId()

  let ownerAcc = await getOwnerOrImpersonate(developer)
  const governance = readAddressMappingIfExists('governance.json')
  const protocol = readAddressMappingIfExists('protocol.json')

  const ladle = (await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as unknown as Ladle
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  // Remember to put enough DAI and USDC in the Timelock to initialize strategies

  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await orchestrateStrategiesProposal(ownerAcc, newStrategies, timelock, strategiesData))
  proposal = proposal.concat(await initStrategiesProposal(ownerAcc, newStrategies, ladle, timelock, strategiesInit))

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()

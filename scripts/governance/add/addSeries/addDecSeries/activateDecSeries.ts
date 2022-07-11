import { ethers } from 'hardhat'
import {
  readAddressMappingIfExists,
  getOwnerOrImpersonate,
  getOriginalChainId,
  proposeApproveExecute,
} from '../../../../../shared/helpers'

import { Cauldron, Ladle, Roller, EmergencyBrake, Timelock } from '../../../../../typechain'

import { orchestrateRollerProposal } from '../../../../fragments/utils/orchestrateRollerProposal'
import { addSeriesProposal } from '../../../../fragments/assetsAndSeries/addSeriesProposal'
import { addIlksToSeriesProposal } from '../../../../fragments/assetsAndSeries/addIlksToSeriesProposal'
import { rollStrategiesProposal } from '../../../../fragments/core/strategies/rollStrategiesProposal'
import { initPoolsProposal } from '../../../../fragments/assetsAndSeries/initPoolsProposal'

const { developer, deployer, seriesIlks, poolsInit, rollData } = require(process.env.CONF as string)
const { protocol, governance, strategies, joins, newPools, newFYTokens } = require(process.env.CONF as string)
/**
 * @dev This script deploys two series
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron
  const ladle = (await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as unknown as Ladle
  const roller = (await ethers.getContractAt('Roller', protocol.get('roller') as string, ownerAcc)) as unknown as Roller
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
  proposal = proposal.concat(await orchestrateRollerProposal(deployer, strategies, roller, timelock, cloak, rollData))
  proposal = proposal.concat(
    await addSeriesProposal(ownerAcc, deployer, cauldron, ladle, timelock, cloak, joins, newFYTokens, newPools)
  )
  proposal = proposal.concat(await addIlksToSeriesProposal(cauldron, seriesIlks))
  proposal = proposal.concat(await initPoolsProposal(ownerAcc, timelock, newPools, poolsInit))
  proposal = proposal.concat(await rollStrategiesProposal(ownerAcc, protocol, strategies, newPools, timelock, rollData))

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string, developer)
})()

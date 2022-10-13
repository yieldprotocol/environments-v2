import { ethers } from 'hardhat'
import { getOwnerOrImpersonate, proposeApproveExecute } from '../../../../../shared/helpers'

import { Pool } from '../../../../../typechain'

import { addSeriesProposal } from '../../../../fragments/assetsAndSeries/addSeriesProposal'
import { addIlksToSeriesProposal } from '../../../../fragments/assetsAndSeries/addIlksToSeriesProposal'
import { rollStrategiesProposal } from '../../../../fragments/core/strategies/rollStrategiesProposal'
import { initPoolsProposal } from '../../../../fragments/assetsAndSeries/initPoolsProposal'
import { orchestrateNewPoolsProposal } from '../../../../fragments/assetsAndSeries/orchestrateNewPoolsProposal'
import { orchestrateRollerProposal } from '../../../../fragments/utils/orchestrateRollerProposal'

const { developer, deployer, seriesIlks, poolsInit, rollData } = require(process.env.CONF as string)
const { protocol, governance, strategies, joins, newPools, newFYTokens } = require(process.env.CONF as string)
/**
 * @dev This script orchestrates a new series and rolls liquidity in the related strategies
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc)
  const ladle = await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)
  const roller = await ethers.getContractAt('Roller', protocol.get('roller') as string, ownerAcc)
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc)
  const cloak = await ethers.getContractAt('EmergencyBrake', governance.get('cloak') as string, ownerAcc)

  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await orchestrateRollerProposal(deployer, strategies, roller, timelock, cloak, rollData))
  for (let [seriesId, poolAddress] of newPools) {
    const pool: Pool = await ethers.getContractAt('Pool', poolAddress as string, ownerAcc)
    console.log(`orchestrating ${seriesId} pool at address: ${poolAddress}`)
    proposal = proposal.concat(await orchestrateNewPoolsProposal(deployer as string, pool, timelock, cloak))
  }

  proposal = proposal.concat(
    await addSeriesProposal(ownerAcc, deployer, cauldron, ladle, timelock, cloak, joins, newFYTokens, newPools)
  )
  proposal = proposal.concat(await addIlksToSeriesProposal(cauldron, seriesIlks))
  proposal = proposal.concat(await initPoolsProposal(ownerAcc, timelock, newPools, poolsInit))
  proposal = proposal.concat(await rollStrategiesProposal(ownerAcc, protocol, strategies, newPools, timelock, rollData))
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string, developer)
})()

import { ethers } from 'hardhat'
import { getOwnerOrImpersonate, propose } from '../../../../../shared/helpers'

import { Pool } from '../../../../../typechain'

import { addSeriesProposal } from '../../../../fragments/assetsAndSeries/addSeriesProposal'
import { addIlksToSeriesProposal } from '../../../../fragments/assetsAndSeries/addIlksToSeriesProposal'
import { orchestrateNewPoolsProposal } from '../../../../fragments/assetsAndSeries/orchestrateNewPoolsProposal'

const { developer, deployer, seriesIlks } = require(process.env.CONF as string)
const { protocol, governance, joins, newPools, newFYTokens } = require(process.env.CONF as string)
/**
 * @dev This script orchestrates a new series and rolls liquidity in the related strategies
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc)
  const ladle = await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc)
  const cloak = await ethers.getContractAt('OldEmergencyBrake', governance.get('cloak') as string, ownerAcc)

  let proposal: Array<{ target: string; data: string }> = []
  for (let [seriesId, poolAddress] of newPools) {
    const pool: Pool = await ethers.getContractAt('Pool', poolAddress as string, ownerAcc)
    console.log(`orchestrating ${seriesId} pool at address: ${poolAddress}`)
    proposal = proposal.concat(await orchestrateNewPoolsProposal(deployer as string, pool, timelock, cloak))
  }

  proposal = proposal.concat(
    await addSeriesProposal(ownerAcc, deployer, cauldron, ladle, timelock, cloak, joins, newFYTokens, newPools)
  )
  proposal = proposal.concat(await addIlksToSeriesProposal(cauldron, seriesIlks))
  await propose(timelock, proposal, developer)
})()

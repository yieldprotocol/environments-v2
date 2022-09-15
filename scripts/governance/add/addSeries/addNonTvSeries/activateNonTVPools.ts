import { ethers, network } from 'hardhat'
import {
  readAddressMappingIfExists,
  getOwnerOrImpersonate,
  getOriginalChainId,
  proposeApproveExecute,
  jsonToMap,
} from '../../../../../shared/helpers'
import * as fs from 'fs'

import { Pool, Cauldron, Ladle, Roller, EmergencyBrake, Timelock } from '../../../../../typechain'

import { orchestrateRollerProposal } from '../../../../fragments/utils/orchestrateRollerProposal'
import { addSeriesProposal } from '../../../../fragments/assetsAndSeries/addSeriesProposal'
import { addIlksToSeriesProposal } from '../../../../fragments/assetsAndSeries/addIlksToSeriesProposal'
import { rollStrategiesProposal } from '../../../../fragments/core/strategies/rollStrategiesProposal'
import { initPoolsProposal } from '../../../../fragments/assetsAndSeries/initPoolsProposal'
import { orchestrateNewPoolsProposal } from '../../../../fragments/assetsAndSeries/orchestrateNewPoolsProposal'

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

  //orchestrate newPools
  const path = `./addresses/${network.name}/`
  const pools = jsonToMap(fs.readFileSync(`${path}newPools.json`, 'utf8')) as Map<string, string>

  for (let [seriesId, poolAddress] of pools) {
    const pool: Pool = (await ethers.getContractAt('Pool', poolAddress as string, ownerAcc)) as unknown as Pool

    console.log(`adding proposal for pool for series: ${seriesId} at address: ${poolAddress}`)
    proposal = proposal.concat(await orchestrateNewPoolsProposal(deployer as string, pool as Pool, timelock, cloak))
  }

  // NO ROLLER
  // proposal = proposal.concat(await orchestrateRollerProposal(deployer, strategies, roller, timelock, cloak, rollData))

  proposal = proposal.concat(
    await addSeriesProposal(ownerAcc, deployer, cauldron, ladle, timelock, cloak, joins, newFYTokens, newPools)
  )

  proposal = proposal.concat(await addIlksToSeriesProposal(cauldron, seriesIlks))
  proposal = proposal.concat(await initPoolsProposal(ownerAcc, timelock, newPools, poolsInit))
  proposal = proposal.concat(await rollStrategiesProposal(ownerAcc, protocol, strategies, newPools, timelock, rollData))
  console.log('**************************************************************************************************')
  console.log(developer)
  console.log(governance.get('multisig'))
  console.log('**************************************************************************************************')
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string, developer)
})()

import { ethers, network } from 'hardhat'
import { impersonate, proposeApproveExecute, getOwnerOrImpersonate, jsonToMap } from '../../../shared/helpers'
import * as fs from 'fs'

import { orchestrateNewPoolsProposal } from '../../fragments/assetsAndSeries/orchestrateNewPoolsProposal'

const { protocol, governance } = require(process.env.CONF as string)
const { deployer, developer } = require(process.env.CONF as string)
import { Pool, EmergencyBrake, Ladle, Witch, PoolEuler, Timelock, YieldMath } from '../../../typechain'

import { ROOT } from '../../../shared/constants'

/**
 * @dev This script orchestrates the new Pools
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)
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
  const ladle = (await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as unknown as Ladle
  const witch = (await ethers.getContractAt('Witch', protocol.get('witch') as string, ownerAcc)) as unknown as Witch

  const path = `./addresses/${network.name}/`
  const pools = jsonToMap(fs.readFileSync(`${path}newPools.json`, 'utf8')) as Map<string, string>

  //iterate through newPools
  for (let [seriesId, poolAddress] of pools) {
    let proposal: Array<{ target: string; data: string }> = []
    const pool: PoolEuler = (await ethers.getContractAt(
      'PoolEuler',
      poolAddress as string,
      ownerAcc
    )) as unknown as PoolEuler
    if (!(await pool.hasRole(ROOT, timelock.address))) {
      await pool.connect(ownerAcc).grantRole(ROOT, timelock.address)
      console.log(`pool.grantRoles(ROOT, timelock)`)
      while (!(await pool.hasRole(ROOT, timelock.address))) {}
    }
    console.log(`adding proposal for pool for series: ${seriesId} at address: ${poolAddress}`)
    proposal = proposal.concat(await orchestrateNewPoolsProposal(deployer as string, pool as Pool, timelock, cloak))
    // Propose, Approve & execute
    console.log('proposeApproveExecute')
    await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string, developer)
  }
})()

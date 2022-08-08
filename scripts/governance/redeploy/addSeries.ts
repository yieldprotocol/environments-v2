import { ethers } from 'hardhat'
import { getOwnerOrImpersonate, proposeApproveExecute } from '../../../shared/helpers'

import { addSeriesProposal } from '../../fragments/assetsAndSeries/addSeriesProposal'
import { addIlksToSeriesProposal } from '../../fragments/assetsAndSeries/addIlksToSeriesProposal'
import { initPoolsProposal } from '../../fragments/assetsAndSeries/initPoolsProposal'
import { Cauldron, Ladle, EmergencyBrake, Timelock } from '../../../typechain'
const { protocol, governance, newFYTokens, newPools } = require(process.env.CONF as string)
const { developer, deployer, seriesIlks, poolsInit, newJoins } = require(process.env.CONF as string)

/**
 * @dev This script orchestrates fyToken, registers them as series in the Cauldron, initializes pools, and registers them in the Ladle
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

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
  proposal = proposal.concat(
    await addSeriesProposal(ownerAcc, deployer, cauldron, ladle, timelock, cloak, newJoins, newFYTokens, newPools)
  )
  proposal = proposal.concat(await addIlksToSeriesProposal(cauldron, seriesIlks))
  proposal = proposal.concat(await initPoolsProposal(ownerAcc, timelock, newPools, poolsInit))

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()

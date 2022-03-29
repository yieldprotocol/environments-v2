import { ethers } from 'hardhat'
import {
  getOwnerOrImpersonate,
  proposeApproveExecute,
} from '../../../shared/helpers'

import { grantDevelopersProposal } from '../../fragments/permissions/grantDevelopersProposal'
import { grantGovernorsProposal } from '../../fragments/permissions/grantGovernorsProposal'
import { Timelock, EmergencyBrake } from '../../../typechain'
const { governance } = require(process.env.CONF as string)
const { developer, additionalDevelopers, additionalGovernors } = require(process.env.CONF as string)

/**
 * @dev This script adds developers and governors
 */

;(async () => {

  let ownerAcc = await getOwnerOrImpersonate(developer)

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

  // Remember to put enough DAI and USDC in the Timelock to initialize pools and strategies

  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await grantDevelopersProposal(timelock, cloak, additionalDevelopers))
  proposal = proposal.concat(await grantGovernorsProposal(timelock, cloak, additionalGovernors))

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()

import { ethers } from 'hardhat'
import { Timelock, Giver, YieldNotionalLever } from '../../../../typechain'
import { getOwnerOrImpersonate, proposeApproveExecute } from '../../../../shared/helpers'
import { orchestrateLeverProposal } from '../../../fragments/utils/orchestrateLeverProposal'
const { developer, deployer } = require(process.env.CONF as string)
const { protocol, governance } = require(process.env.CONF as string)

/**
 * @dev This script orchestrates the YieldNotionalLever
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)
  const timelock = (await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc)) as Timelock
  const giver = (await ethers.getContractAt('Giver', protocol.get('giver') as string, ownerAcc)) as Giver
  const lever = (await ethers.getContractAt(
    'YieldNotionalLever',
    protocol.get('yieldNotionalLever') as string,
    ownerAcc
  )) as any

  const proposal: Array<{ target: string; data: string }> = await orchestrateLeverProposal(lever, giver)

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string, developer)
})()

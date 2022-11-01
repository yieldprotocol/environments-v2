import { ethers } from 'hardhat'
import { Timelock, Giver, YieldStrategyLever } from '../../../../typechain'
import { getOwnerOrImpersonate, proposeApproveExecute } from '../../../../shared/helpers'
import { orchestrateLeverProposal } from '../../../fragments/utils/orchestrateLeverProposal'
const { developer, deployer } = require(process.env.CONF as string)
const { protocol, governance } = require(process.env.CONF as string)

/**
 * @dev This script orchestrates the YieldStrategyLever
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)
  const timelock = (await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc)) as Timelock
  const giver = (await ethers.getContractAt('Giver', protocol.get('giver') as string, ownerAcc)) as Giver
  const yieldStrategyLever = (await ethers.getContractAt(
    'YieldStrategyLever',
    protocol.get('yieldStrategyLever') as string,
    ownerAcc
  )) as YieldStrategyLever

  const proposal: Array<{ target: string; data: string }> = await orchestrateLeverProposal(yieldStrategyLever, giver)

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string, developer)
})()

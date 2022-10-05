import { ethers } from 'hardhat'
import { Timelock, Giver, YieldStEthLever } from '../../../../typechain'
import { getOwnerOrImpersonate, proposeApproveExecute } from '../../../../shared/helpers'
import { orchestrateYieldStethLeverProposal } from '../../../fragments/utils/orchestrateYieldStethLeverProposal'
const { developer, deployer } = require(process.env.CONF as string)
const { protocol, governance } = require(process.env.CONF as string)

/**
 * @dev This script orchestrates the YieldStEthLever
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)
  const timelock = (await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc)) as Timelock
  const giver = (await ethers.getContractAt('Giver', protocol.get('giver') as string, ownerAcc)) as Giver
  const yieldStEthLever = (await ethers.getContractAt(
    'YieldStEthLever',
    protocol.get('yieldStEthLever') as string,
    ownerAcc
  )) as YieldStEthLever

  const proposal: Array<{ target: string; data: string }> = await orchestrateYieldStethLeverProposal(
    yieldStEthLever,
    giver
  )

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string, developer)
})()

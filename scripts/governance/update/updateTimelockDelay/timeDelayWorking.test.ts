/**
 * @dev This script tests whether the updated Timelock delay is working as expected
 */
import { updateTimelockDelayProposal } from '../../fragments/timelock/updateTimelockDelayProposal'
import { ethers } from 'hardhat'
import * as hre from 'hardhat'
import { expect } from 'chai'

import { getOwnerOrImpersonate, proposeApproveExecute } from '../../../shared/helpers'

import { Timelock } from '../../../typechain/Timelock'
const { developer, newDelayTime, governance } = require(process.env.CONF as string)

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  // Contract instantiation
  const timeLock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock
  const timelockDelay = await timeLock.delay()
  if (timelockDelay === newDelayTime) {
    console.log(`New delay set to ` + timelockDelay)
    let proposal: Array<{ target: string; data: string }> = []
    proposal = proposal.concat(await updateTimelockDelayProposal(timeLock, newDelayTime))

    await proposeApproveExecute(timeLock, proposal, governance.get('multisig') as string)
    await proposeApproveExecute(timeLock, proposal, governance.get('multisig') as string)
    console.log('Executing')
    await expect(proposeApproveExecute(timeLock, proposal, governance.get('multisig') as string)).to.be.revertedWith(
      'ETA not reached.'
    )
    console.log('Execution failed')
    await hre.network.provider.request({ method: 'evm_increaseTime', params: [60 * 60 * 24 * 2] })
    await hre.network.provider.request({ method: 'evm_mine', params: [] })
    console.log('Time travelled 2 days')
    await proposeApproveExecute(timeLock, proposal, governance.get('multisig') as string)
  } else console.log('Still old delay')
})()

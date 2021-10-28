/**
 * @dev This script updates the dust limits for one or more base/ilk pairs.
 *
 * It takes as inputs the governance and protocol address files.
 */

import { ethers } from 'hardhat'
import * as hre from 'hardhat'
import * as fs from 'fs'

import { bytesToString, jsonToMap } from '../../../shared/helpers'
import { ETH, DAI, USDC, WBTC, USDT } from '../../../shared/constants'

import { Cauldron } from '../../../typechain/Cauldron'
import { Timelock } from '../../../typechain/Timelock'

import { newMin } from './updateDust.config'

;(async () => {
  // Input data: baseId, ilkId, minDebt
  const newLimits: Array<[string, string, number]> = [
    [DAI, ETH, 1],
    [USDC, ETH, 1],
  ]

  const governance = jsonToMap(fs.readFileSync('./addresses/governance.json', 'utf8')) as Map<string, string>
  const protocol = jsonToMap(fs.readFileSync('./addresses/protocol.json', 'utf8')) as Map<string, string>

  let [ownerAcc] = await ethers.getSigners()
  // If we are running in a mainnet fork, the account used is the default hardhat one, we can detect that and impersonate a developer
  const on_fork = (ownerAcc.address === "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
  if (on_fork) {
    const developer = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
    console.log(`Running on a fork, impersonating ${developer}`)
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [developer],
    });
    ownerAcc = await ethers.getSigner(developer)
  }
  
  // Contract instantiation
  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []
  for (let [baseId, ilkId, minDebt] of newMin) {
    // We need to pass `max` and `dec`, but we don't want to change them, so we read them from the contract
    const debt = await cauldron.debt(baseId, ilkId)
    proposal.push({
      target: cauldron.address,
      data: cauldron.interface.encodeFunctionData('setDebtLimits', [baseId, ilkId, debt.max, minDebt, debt.dec]),
    })
    console.log(`${bytesToString(baseId)}/${bytesToString(ilkId)}: ${debt.min} -> ${minDebt}`)
  }

  // Propose, approve, execute
  const txHash = await timelock.hash(proposal)
  console.log(`Proposal: ${txHash}`)

  // Depending on the proposal state, propose, approve (if in a fork, impersonating the multisig), or execute
  if ((await timelock.proposals(txHash)).state === 0) { // Propose
    await timelock.propose(proposal)
    while ((await timelock.proposals(txHash)).state < 1) {}
    console.log(`Proposed ${txHash}`)
  } else if ((await timelock.proposals(txHash)).state === 1) { // Approve, impersonating multisig if in a fork
    if (on_fork){
      // If running on a mainnet fork, impersonating the multisig will work
      const multisig = governance.get('multisig') as string
      console.log(`Running on a fork, impersonating multisig at ${multisig}`)
      await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [multisig],
      });
      const multisigAcc = await ethers.getSigner(multisig)
      await timelock.connect(multisigAcc).approve(txHash)
      while ((await timelock.proposals(txHash)).state < 2) {}
      console.log(`Approved ${txHash}`)
    } else {
      console.log("Can't do, go bug the multisig owners");
    }
  } else if ((await timelock.proposals(txHash)).state === 2) { // Execute
    await timelock.execute(proposal)
    while ((await timelock.proposals(txHash)).state > 0) {}
    console.log(`Executed ${txHash}`)
  }
})()

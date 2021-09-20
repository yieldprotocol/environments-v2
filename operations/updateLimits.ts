/**
 * @dev This script updates the dust and ceiling limits for one or more base/ilk pairs.
 * 
 * It takes as inputs the governance and protocol address files.
 */

import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { stringToBytes6, bytesToString, jsonToMap } from '../shared/helpers'
import { ETH, DAI, USDC, WBTC, USDT } from '../shared/constants'

import { Cauldron } from '../typechain/Cauldron'

import { Timelock } from '../typechain/Timelock'

(async () => {
  // Input data: baseId, ilkId, maxDebt, minDebt, debtDec
  const newLimits: Array<[string, string, number, number, number]> = [
    [DAI, DAI, 1000000, 0, 18],
    /* [DAI, USDC, 1000000, 1, 18],
    [DAI, ETH, 1000000, 1, 18],
    [DAI, WBTC, 1000000, 1, 18],
    [DAI, USDT, 1000000, 1, 18],*/
    [USDC, USDC, 1000000, 0, 6],
    /* [USDC, DAI, 1000000, 1, 6],
    [USDC, ETH, 1000000, 1, 6],
    [USDC, WBTC, 1000000, 1, 6],
    [USDC, USDT, 1000000, 1, 6],
    [USDT, USDT, 1000000, 0, 18],
    [USDT, DAI, 1000000, 1, 18],
    [USDT, USDC, 1000000, 1, 18],
    [USDT, ETH, 1000000, 1, 18],
    [USDT, WBTC, 1000000, 1, 18]*/
  ]
  const [ ownerAcc ] = await ethers.getSigners();
  const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string, string>;
  const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string,string>;

  // Contract instantiation
  const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc) as unknown as Cauldron
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc) as unknown as Timelock

  // Build the proposal
  const proposal : Array<{ target: string; data: string}> = []
  for (let [baseId, ilkId, maxDebt, minDebt, debtDec] of newLimits) {

    proposal.push({
      target: cauldron.address,
      data: cauldron.interface.encodeFunctionData('setDebtLimits', [
        baseId, ilkId, maxDebt, minDebt, debtDec
      ])
    })
    console.log(`${bytesToString(baseId)}/${bytesToString(ilkId)}`)
  }

  // Propose, approve, execute
  const txHash = await timelock.callStatic.propose(proposal)
  { await timelock.propose(proposal); console.log(`Proposed ${txHash}`) }
  { await timelock.approve(txHash); console.log(`Approved ${txHash}`) }
  { await timelock.execute(proposal); console.log(`Executed ${txHash}`) }
})()
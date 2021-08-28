/**
 * @dev This script makes one or more assets into ilks for one or more bases.
 * 
 * It takes as inputs the governance and protocol address files.
 * It uses the Wand to set the spot oracle, debt limits, and allow the Witch to liquidate collateral.
 */

import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { bytesToString, stringToBytes6, bytesToBytes32, jsonToMap } from '../shared/helpers'
import { WAD, DAI, USDC, ETH, WBTC, USDT } from '../shared/constants'

import { Wand } from '../typechain/Wand'
import { IOracle } from '../typechain/IOracle'

import { Timelock } from '../typechain/Timelock'

(async () => {
  const TST = stringToBytes6('TST')
  const CHAINLINK = 'chainlinkOracle'
  const COMPOSITE = 'compositeOracle'
  // Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), maxDebt, minDebt, debtDec
  const newIlks: Array<[string, string, string, number, number, number, number]> = [
    // [DAI, stringToBytes6('TST1'), 'chainlinkOracle', 1000000, 1000000, 1, 18],
    [DAI, DAI, CHAINLINK, 1000000, 1000000, 1, 18], // Constant 1
    [DAI, USDC, COMPOSITE, 1000000, 1000000, 1, 18], // Composite, via ETH
    [DAI, ETH, CHAINLINK, 1000000, 1000000, 1, 18],
    [DAI, TST, CHAINLINK, 1000000, 1000000, 1, 18], // Mock
    [DAI, WBTC, COMPOSITE, 1000000, 1000000, 1, 18], // Composite, via ETH
    [DAI, USDT, COMPOSITE, 1000000, 1000000, 1, 18], // Composite, via ETH
    [USDC, USDC, CHAINLINK, 1000000, 1000000, 1, 18], // Constant 1
    [USDC, DAI, COMPOSITE, 1000000, 1000000, 1, 18], // Composite, via ETH
    [USDC, ETH, CHAINLINK, 1000000, 1000000, 1, 18],
    [USDC, TST, CHAINLINK, 1000000, 1000000, 1, 18], // Mock
    [USDC, WBTC, COMPOSITE, 1000000, 1000000, 1, 18], // Composite, via ETH
    [USDC, USDT, COMPOSITE, 1000000, 1000000, 1, 18], // Composite, via ETH
    [USDT, USDT, CHAINLINK, 1000000, 1000000, 1, 18], // Constant 1
    [USDT, DAI, COMPOSITE, 1000000, 1000000, 1, 18], // Composite, via ETH
    [USDT, USDC, COMPOSITE, 1000000, 1000000, 1, 18], // Composite, via ETH
    [USDT, ETH, CHAINLINK, 1000000, 1000000, 1, 18],
    [USDT, TST, CHAINLINK, 1000000, 1000000, 1, 18], // Mock
    [USDT, WBTC, COMPOSITE, 1000000, 1000000, 1, 18] // Composite, via ETH
  ]
  const [ ownerAcc ] = await ethers.getSigners();
  const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string, string>;
  const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string,string>;

  // Contract instantiation
  const wand = await ethers.getContractAt('Wand', protocol.get('wand') as string, ownerAcc) as unknown as Wand
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc) as unknown as Timelock

  // Build the proposal
  const proposal : Array<{ target: string; data: string}> = []
  for (let [baseId, ilkId, oracleName, ratio, maxDebt, minDebt, debtDec] of newIlks) {
    console.log(oracleName)
    // Test that the sources for spot have been set. Peek will fail with 'Source not found' if they have not.
    const spotOracle = await ethers.getContractAt('IOracle', protocol.get(oracleName) as string, ownerAcc) as unknown as IOracle
    console.log(`Looking for ${baseId}/${ilkId} at ${protocol.get(oracleName) as string}`)
    console.log(`Current SPOT for ${bytesToString(baseId)}/${bytesToString(ilkId)}: ${(await spotOracle.peek(bytesToBytes32(baseId), bytesToBytes32(ilkId), WAD))[0]}`)

    proposal.push({
      target: wand.address,
      data: wand.interface.encodeFunctionData('makeIlk', [
        baseId, ilkId, spotOracle.address, ratio, maxDebt, minDebt, debtDec
      ])
    })
    console.log(`[Asset: ${bytesToString(ilkId)} made into ilk for ${bytesToString(baseId)}],`)
  }

  // Propose, approve, execute
  const txHash = await timelock.callStatic.propose(proposal)
  await timelock.propose(proposal); console.log(`Proposed ${txHash}`)
  await timelock.approve(txHash); console.log(`Approved ${txHash}`)
  await timelock.execute(proposal); console.log(`Executed ${txHash}`)
})()
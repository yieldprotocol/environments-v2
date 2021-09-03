/**
 * @dev This script updates the spot oracles and ratios for one or more base/ilk pairs.
 * 
 * It takes as inputs the governance and protocol address files.
 */

import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { stringToBytes6, bytesToString, bytesToBytes32, jsonToMap } from '../shared/helpers'
import { WAD, ETH, DAI, USDC, WBTC, USDT } from '../shared/constants'

import { Cauldron } from '../typechain/Cauldron'
import { IOracle } from '../typechain/IOracle'
import { ChainlinkMultiOracle } from '../typechain/ChainlinkMultiOracle'
import { Timelock } from '../typechain/Timelock'

(async () => {
  const TST = stringToBytes6('TST')
  const CHAINLINK = 'chainlinkOracle'
  const COMPOSITE = 'compositeOracle'

  // Input data: baseId, ilkId, maxDebt, minDebt, debtDec
  const newSpotOracles: Array<[string, string, string, number]> = [
    [DAI, DAI, CHAINLINK, 1000000],
    [DAI, USDC, CHAINLINK, 1000000],
    [DAI, ETH, CHAINLINK, 1000000],
    // [DAI, TST, CHAINLINK, 1000000],
    [DAI, WBTC, CHAINLINK, 1000000],
    [DAI, USDT, CHAINLINK, 1000000],
    /* [USDC, USDC, CHAINLINK, 1000000],
    [USDC, DAI, CHAINLINK, 1000000],
    [USDC, ETH, CHAINLINK, 1000000],
    // [USDC, TST, CHAINLINK, 1000000],
    [USDC, WBTC, CHAINLINK, 1000000],
    [USDC, USDT, CHAINLINK, 1000000], */
    [USDT, USDT, CHAINLINK, 1000000],
    [USDT, DAI, CHAINLINK, 1000000],
    [USDT, USDC, CHAINLINK, 1000000],
    [USDT, ETH, CHAINLINK, 1000000],
    // [USDT, TST, CHAINLINK, 1000000],
    [USDT, WBTC, CHAINLINK, 1000000],
  ]
  // cauldron.setSpotOracle(baseId, ilkId, IOracle(address(oracle)), ratio);
  const [ ownerAcc ] = await ethers.getSigners();
  const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string, string>;
  const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string,string>;

  // Contract instantiation
  const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc) as unknown as Cauldron
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc) as unknown as Timelock

  // Build the proposal
  const proposal : Array<{ target: string; data: string}> = []
  for (let [baseId, ilkId, oracleName, ratio] of newSpotOracles) {
    // Test that the sources for spot have been set. Peek will fail with 'Source not found' if they have not.
    const spotOracle = await ethers.getContractAt('ChainlinkMultiOracle', protocol.get(oracleName) as string, ownerAcc) as unknown as ChainlinkMultiOracle
    console.log(`Looking for ${baseId}/${ilkId} at ${protocol.get(oracleName) as string}`)
    console.log(`Source for ${bytesToString(baseId)}/${bytesToString(ilkId)}: ${await spotOracle.sources(baseId, ilkId)}`)
    console.log(`Current SPOT for ${bytesToString(baseId)}/${bytesToString(ilkId)}: ${(await spotOracle.peek(bytesToBytes32(baseId), bytesToBytes32(ilkId), WAD))[0]}`)

    proposal.push({
      target: cauldron.address,
      data: cauldron.interface.encodeFunctionData('setSpotOracle', [
        baseId, ilkId, spotOracle.address, ratio
      ])
    })
    console.log(`${bytesToString(baseId)}/${bytesToString(ilkId)}`)
  }

  // Propose, approve, execute
  const txHash = await timelock.callStatic.propose(proposal)
  await timelock.propose(proposal); console.log(`Proposed ${txHash}`)
  await timelock.approve(txHash); console.log(`Approved ${txHash}`)
  await timelock.execute(proposal); console.log(`Executed ${txHash}`)
})()
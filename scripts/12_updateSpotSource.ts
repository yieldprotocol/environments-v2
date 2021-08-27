/**
 * @dev This script replaces one or more spot data sources in a MultiOracle.
 * 
 * It takes as inputs the governance, protocol and spotSources json address files.
 * It rewrites the spotSources json address file.
 * @notice This can be used to update RATE and CHI by entering those as quoteId, and using a rate and chi oracle
 */

import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { stringToBytes6, bytesToString, mapToJson, jsonToMap } from '../shared/helpers'
import { DAI, ETH, USDC, USDT, WBTC } from '../shared/constants'

import { ChainlinkMultiOracle } from '../typechain/ChainlinkMultiOracle' // TODO: Change to IOracleGov
import { Timelock } from '../typechain/Timelock'

(async () => {
  const TST = stringToBytes6('TST')
  // Input data: baseId, quoteId, oracle name, source address
  const newSources: Array<[string, string, string, string]> = [
    // [DAI, stringToBytes6('TST1'), 'chainlinkOracle', "0xF32D39ff9f6Aa7a7A64d7a4F00a54826Ef791a55"],
    [DAI, DAI,   'chainlinkOracle', "0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44"],
    [DAI, ETH,   'chainlinkOracle', "0x4A679253410272dd5232B3Ff7cF5dbB88f295319"],
    [DAI, TST,   'chainlinkOracle', "0x09635F643e140090A9A8Dcd712eD6285858ceBef"],
    [USDC, USDC, 'chainlinkOracle', "0x67d269191c92Caf3cD7723F116c85e6E9bf55933"],
    [USDC, ETH,  'chainlinkOracle', "0xc3e53F4d16Ae77Db1c982e75a937B9f60FE63690"],
    [USDC, TST,  'chainlinkOracle', "0x9E545E3C0baAB3E08CdfD552C960A1050f373042"],
    [USDT, USDT, 'chainlinkOracle', "0x1613beB3B2C4f22Ee086B2b38C1476A3cE7f78E8"],
    [USDT, ETH,  'chainlinkOracle', "0xf5059a5D33d5853360D16C683c16e67980206f36"],
    [USDT, TST,  'chainlinkOracle', "0x998abeb3E57409262aE5b751f60747921B33613E"],
    [WBTC, ETH,  'chainlinkOracle', "0x4826533B4897376654Bb4d4AD88B7faFD0C98528"]
  ]
  const [ ownerAcc ] = await ethers.getSigners();
  const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string, string>;
  const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string,string>;
  const spotSources = jsonToMap(fs.readFileSync('./output/spotSources.json', 'utf8')) as Map<string, string>;

  // Contract instantiation
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc) as unknown as Timelock

  // Build proposal
  const proposal : Array<{ target: string; data: string}> = []
  for (let [baseId, quoteId, oracleName, sourceAddress] of newSources) {
    const pairId = `${baseId},${quoteId}`
    const oracle = await ethers.getContractAt('ChainlinkMultiOracle', protocol.get(oracleName) as string, ownerAcc) as unknown as ChainlinkMultiOracle

    proposal.push({
      target: oracle.address,
      data: oracle.interface.encodeFunctionData("setSource", [baseId, quoteId, sourceAddress])
    })
    console.log(`[spot: ${bytesToString(baseId)}/${bytesToString(quoteId)}: ${spotSources.get(pairId) || undefined} -> ${sourceAddress}],`)
    spotSources.set(pairId, sourceAddress)
  }

  // Propose, update, execute
  const txHash = await timelock.callStatic.propose(proposal)
  await timelock.propose(proposal); console.log(`Proposed ${txHash}`)

  fs.writeFileSync('./output/spotSources.json', mapToJson(spotSources), 'utf8')

  await timelock.approve(txHash); console.log(`Approved ${txHash}`)
  await timelock.execute(proposal); console.log(`Executed ${txHash}`)
})()

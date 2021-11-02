/**
 * @dev This script replaces one or more data sources in a CompositeMultiOracle.
 * These data sources are IOracle contracts that will be used either directly or as part of paths.
 *
 * It takes as inputs the governance and protocol json address files.
 */

import { ethers } from 'hardhat'
import * as fs from 'fs'
import { bytesToString, bytesToBytes32, jsonToMap, getOwnerOrImpersonate, proposeApproveExecute } from '../../../shared/helpers'
import { WAD } from '../../../shared/constants'

import { CompositeMultiOracle, ChainlinkMultiOracle, Timelock } from '../../../typechain/'

import { newCompositePairs } from './updateCompositePairs.config'

;(async () => {
  const developer = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
  let ownerAcc = await getOwnerOrImpersonate(developer)
  const governance = jsonToMap(fs.readFileSync('./addresses/governance.json', 'utf8')) as Map<string, string>
  const protocol = jsonToMap(fs.readFileSync('./addresses/protocol.json', 'utf8')) as Map<string, string>

  // Contract instantiation
  const compositeOracle = (await ethers.getContractAt(
    'CompositeMultiOracle',
    protocol.get('compositeOracle') as string,
    ownerAcc
  )) as unknown as CompositeMultiOracle
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  // Build proposal
  const proposal: Array<{ target: string; data: string }> = []
  for (let [baseId, quoteId, oracleName] of newCompositePairs) {

    // Test that the pair has been set in the inner oracle. Peek will fail with 'Source not found' if they have not.
    const innerOracle = (await ethers.getContractAt(
      'ChainlinkMultiOracle',
      protocol.get(oracleName) as string,
      ownerAcc
    )) as unknown as ChainlinkMultiOracle
    console.log(`Looking for ${baseId}/${quoteId} at ${protocol.get(oracleName) as string}`)
    console.log(
      `Source for ${bytesToString(baseId)}/${bytesToString(quoteId)}: ${await innerOracle.sources(baseId, quoteId)}`
    )
    console.log(
      `${bytesToString(quoteId)} obtained for WAD ${bytesToString(baseId)}: ${
        (await innerOracle.callStatic.get(bytesToBytes32(baseId), bytesToBytes32(quoteId), WAD))[0]
      }`
    )

    proposal.push({
      target: compositeOracle.address,
      data: compositeOracle.interface.encodeFunctionData('setSource', [
        baseId,
        quoteId,
        protocol.get(oracleName) as string,
      ]),
    })
    console.log(`pair: ${bytesToString(baseId)}/${bytesToString(quoteId)} -> ${protocol.get(oracleName) as string}`)
  }

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()

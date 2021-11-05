/**
 * @dev This script replaces one or more data paths in a CompositeMultiOracle.
 * These data paths are assets that will be used as base and quote of an iteratively calculated price.
 *
 * It takes as inputs the governance and protocol json address files.
 */

import { ethers } from 'hardhat'
import * as fs from 'fs'
import { bytesToString, bytesToBytes32, jsonToMap, getOwnerOrImpersonate, proposeApproveExecute } from '../../../shared/helpers'
import { WAD } from '../../../shared/constants'

import { CompositeMultiOracle, IOracle, Timelock } from '../../../typechain/'

import { newCompositePaths } from './updateCompositePaths.config'

export const updateCompositePathsProposal = async (
  compositeOracle: CompositeMultiOracle,
  compositePaths: [string, string, string[]][]
): Promise<Array<{ target: string; data: string }>>  => {
  const proposal: Array<{ target: string; data: string }> = []
  for (let [baseId, quoteId, path] of compositePaths) {
    // There is no need to test that the sources for each step in the path have been set in the composite oracle, as `setPath` would revert in that case.
    proposal.push({
      target: compositeOracle.address,
      data: compositeOracle.interface.encodeFunctionData('setPath', [baseId, quoteId, path]),
    })
    console.log(`[path: ${bytesToString(baseId)}/${bytesToString(quoteId)} -> ${path}],`)
  }

  return proposal
}

;(async () => {
  const developer = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
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
  const proposal = await updateCompositePathsProposal(compositeOracle, newCompositePaths)

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()

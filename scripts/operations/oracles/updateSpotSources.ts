/**
 * @dev This script replaces one or more spot data sources in a MultiOracle.
 *
 * It takes as inputs the governance, protocol and spotSources json address files.
 * It rewrites the spotSources json address file.
 * @notice This can be used to update RATE and CHI by entering those as quoteId, and using a rate and chi oracle
 */

import { ethers } from 'hardhat'
import * as fs from 'fs'
import { bytesToString, mapToJson, jsonToMap, getOwnerOrImpersonate, proposeApproveExecute } from '../../../shared/helpers'

import { Timelock } from '../../../typechain'
import { updateSpotSourcesProposal } from './updateSpotSourcesProposal'
import { newSpotSources } from './updateSpotSources.config'

;(async () => {
  const developer = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const governance = jsonToMap(fs.readFileSync('./addresses/governance.json', 'utf8')) as Map<string, string>
  const protocol = jsonToMap(fs.readFileSync('./addresses/protocol.json', 'utf8')) as Map<string, string>
  const spotSources = jsonToMap(fs.readFileSync('./addresses/spotSources.json', 'utf8')) as Map<string, string>

  // Contract instantiation
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  // Test that the oracle sources exist
  for (let [baseId, quoteId, oracleName, sourceAddress] of newSpotSources) {
    if ((await ethers.provider.getCode(sourceAddress)) === '0x') throw `Address ${sourceAddress} contains no code`
  }

  // Build proposal
  const proposal = await updateSpotSourcesProposal(ownerAcc, newSpotSources)

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)

  // Record the oracle sources in spotOracles.json
  for (let [baseId, quoteId, oracleName, sourceAddress] of newSpotSources) {
    const pairId = `${baseId},${quoteId}`

    console.log(
      `[spot: ${bytesToString(baseId)}/${bytesToString(quoteId)}: ${
        spotSources.get(pairId) || undefined
      } -> ${sourceAddress}],`
    )
    spotSources.set(pairId, sourceAddress)
  }
  fs.writeFileSync('./addresses/spotSources.json', mapToJson(spotSources), 'utf8')
})()

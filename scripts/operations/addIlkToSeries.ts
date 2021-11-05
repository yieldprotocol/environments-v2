import { ethers } from 'hardhat'
import * as fs from 'fs'
import { bytesToString, jsonToMap, getOwnerOrImpersonate, proposeApproveExecute } from '../../shared/helpers'

import { Cauldron } from '../../typechain/Cauldron'
import { Timelock } from '../../typechain/Timelock'

import { newSeriesIlks } from './addIlkToSeries.config'

export const addIlksToSeriesProposal = async (
  cauldron: Cauldron,
  seriesIlks: Array<[string, string[]]>,
): Promise<Array<{ target: string; data: string }>>  => {
const proposal: Array<{ target: string; data: string }> = []

for (let [seriesId, ilkIds] of seriesIlks) {
  const symbol = bytesToString(seriesId)

  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('addIlks', [seriesId, ilkIds]),
  })
  console.log(`addIlks ${symbol}: ${ilkIds}'`)
}

return proposal
}

;(async () => {
  const developer = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const governance = jsonToMap(fs.readFileSync('./addresses/governance.json', 'utf8')) as Map<string, string>
  const protocol = jsonToMap(fs.readFileSync('./addresses/protocol.json', 'utf8')) as Map<string, string>

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

  const proposal: Array<{ target: string; data: string }> = []

  for (let [seriesId, ilkIds] of newSeriesIlks) {
    const symbol = bytesToString(seriesId)

    proposal.push({
      target: cauldron.address,
      data: cauldron.interface.encodeFunctionData('addIlks', [seriesId, ilkIds]),
    })
    console.log(`addIlks ${symbol}: ${ilkIds}'`)
  }

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()

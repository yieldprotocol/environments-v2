/**
 * @dev This script replaces the data source in the LidoOracle.
 *
 * It takes as inputs the governance and protocol json address files.
 */

import { ethers } from 'hardhat'
import * as fs from 'fs'
import { bytesToString, jsonToMap, getOwnerOrImpersonate, proposeApproveExecute } from '../../../shared/helpers'
import { WAD, WSTETH, STETH } from '../../../shared/constants'

import { LidoOracle, IWstETH, Timelock } from '../../../typechain'

import { newSource } from './updateLidoSource.config'

export const updateLidoSourceProposal = async (
  ownerAcc: any,
  lidoOracle: LidoOracle,
  source: string
): Promise<Array<{ target: string; data: string }>>  => {
  const proposal: Array<{ target: string; data: string }> = []
  if ((await ethers.provider.getCode(newSource)) === '0x') throw `Address ${newSource} contains no code`

  const lidoSource = (await ethers.getContractAt(
    'IWstETH',
    source as string,
    ownerAcc
  )) as unknown as IWstETH
  
  console.log(
    `Current rate for ${bytesToString(STETH)}/${bytesToString(WSTETH)}: ${await lidoSource.callStatic.getWstETHByStETH(WAD)}`
  )
  console.log(
    `Current rate for ${bytesToString(WSTETH)}/${bytesToString(STETH)}: ${await lidoSource.callStatic.getStETHByWstETH(WAD)}`
  )

  proposal.push({
    target: lidoOracle.address,
    data: lidoOracle.interface.encodeFunctionData('setSource', [
      newSource as string,
    ]),
  })
  console.log(`source: ${bytesToString(STETH)}/${bytesToString(WSTETH)} -> ${newSource as string}`)
  return proposal
}

;(async () => {
  const developer = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
  let ownerAcc = await getOwnerOrImpersonate(developer)
  const governance = jsonToMap(fs.readFileSync('./addresses/governance.json', 'utf8')) as Map<string, string>
  const protocol = jsonToMap(fs.readFileSync('./addresses/protocol.json', 'utf8')) as Map<string, string>

  // Contract instantiation
  const lidoOracle = (await ethers.getContractAt(
    'LidoOracle',
    protocol.get('lidoOracle') as string,
    ownerAcc
  )) as unknown as LidoOracle
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  const proposal = await updateLidoSourceProposal(ownerAcc, lidoOracle, newSource)

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()

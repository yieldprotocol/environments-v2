/**
 * @dev This script replaces the data source in the LidoOracle.
 *
 * It takes as inputs the governance and protocol json address files.
 */

import { ethers } from 'hardhat'
import * as fs from 'fs'
import { bytesToString, bytesToBytes32, jsonToMap, getOwnerOrImpersonate, proposeApproveExecute } from '../../../shared/helpers'
import { WAD, STETH, WSTETH } from '../../../shared/constants'

import { LidoOracle, IWstETH, Timelock } from '../../../typechain'

import { newSource } from './updateLidoSource.config'

;(async () => {
  const developer = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
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

  // Build proposal
  const proposal: Array<{ target: string; data: string }> = []
  if ((await ethers.provider.getCode(newSource)) === '0x') throw `Address ${newSource} contains no code`

  const lidoSource = (await ethers.getContractAt(
    'IWstETH',
    newSource as string,
    ownerAcc
  )) as unknown as IWstETH
  
  console.log(
    `Current rate for ${bytesToString(STETH)}/${bytesToString(WSTETH)}: ${await lidoOracle.callStatic.getWstETHByStETH(WAD)}`
  )
  console.log(
    `Current rate for ${bytesToString(WSTETH)}/${bytesToString(STETH)}: ${await lidoOracle.callStatic.getStETHByWstETH(WAD)}`
  )

  proposal.push({
    target: lidoOracle.address,
    data: lidoOracle.interface.encodeFunctionData('setSource', [
      newSource as string,
    ]),
  })
  console.log(`source: ${bytesToString(STETH)}/${bytesToString(WSTETH)} -> ${newSource as string}`)

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()

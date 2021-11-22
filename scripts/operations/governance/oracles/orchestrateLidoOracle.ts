import { ethers } from 'hardhat'
import * as fs from 'fs'
import { jsonToMap, proposeApproveExecute, getOwnerOrImpersonate } from '../../../shared/helpers'
import { orchestrateLidoOracleProposal } from './orchestrateLidoOracleProposal'
import { LidoOracle, EmergencyBrake, Timelock } from '../../../typechain'

/**
 * @dev This script orchestrates the LidoOracle
 *
 * It takes as inputs the governance and protocol json address files.
 * Expectes the Timelock to have ROOT permissions on the LidoOracle.
 * The Cloak gets ROOT access. Root access is removed from the deployer.
 * The Timelock gets access to governance functions.
 */

;(async () => {
  const developer = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const protocol = jsonToMap(fs.readFileSync('./addresses/protocol.json', 'utf8')) as Map<string, string>
  const governance = jsonToMap(fs.readFileSync('./addresses/governance.json', 'utf8')) as Map<string, string>

  const cloak = (await ethers.getContractAt(
    'EmergencyBrake',
    governance.get('cloak') as string,
    ownerAcc
  )) as unknown as EmergencyBrake
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  let lidoOracle = (await ethers.getContractAt('LidoOracle', protocol.get('lidoOracle') as string, ownerAcc)) as unknown as LidoOracle

  const proposal = await orchestrateLidoOracleProposal(ownerAcc, lidoOracle, timelock, cloak)

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()

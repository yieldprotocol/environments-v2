import { ethers, waffle } from 'hardhat'
import * as fs from 'fs'
import { id } from '@yield-protocol/utils-v2'
import { jsonToMap, proposeApproveExecute, getOwnerOrImpersonate } from '../../../shared/helpers'

import { LidoOracle } from '../../../typechain/LidoOracle'
import { EmergencyBrake } from '../../../typechain/EmergencyBrake'
import { Timelock } from '../../../typechain/Timelock'

/**
 * @dev This script orchestrates the LidoOracle
 *
 * It takes as inputs the governance and protocol json address files.
 * Expectes the Timelock to have ROOT permissions on the LidoOracle.
 * The Cloak gets ROOT access. Root access is removed from the deployer.
 * The Timelock gets access to governance functions.
 */

export const lidoOracleProposal = async (
    ownerAcc: any, 
    lidoOracle: LidoOracle,
    timelock: Timelock,
    cloak: EmergencyBrake
  ): Promise<Array<{ target: string; data: string }>>  => {
  const ROOT = await lidoOracle.ROOT()

  // Give access to each of the governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, revoke ROOT from the deployer
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
      target: lidoOracle.address,
      data: lidoOracle.interface.encodeFunctionData('grantRoles', [
          [
              id(lidoOracle.interface, 'setSource(address)'),
          ],
          timelock.address
      ])
  })
  console.log(`lidoOracle.grantRoles(gov, timelock)`)

  proposal.push({
      target: lidoOracle.address,
      data: lidoOracle.interface.encodeFunctionData('grantRole', [ROOT, cloak.address])
  })
  console.log(`lidoOracle.grantRole(ROOT, cloak)`)

  proposal.push({
      target: lidoOracle.address,
      data: lidoOracle.interface.encodeFunctionData('revokeRole', [ROOT, ownerAcc.address])
  })
  console.log(`lidoOracle.revokeRole(ROOT, deployer)`)

  return proposal
}

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

  const proposal = await lidoOracleProposal(ownerAcc, lidoOracle, timelock, cloak)

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()

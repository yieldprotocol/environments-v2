import { ethers, waffle } from 'hardhat'
import * as hre from 'hardhat'
import * as fs from 'fs'
import { id } from '@yield-protocol/utils-v2'
import { WSTETH, STETH } from '../../../shared/constants'
import { mapToJson, jsonToMap, verify, proposeApproveExecute, getOwnerOrImpersonate } from '../../../shared/helpers'

import LidoOracleArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/oracles/lido/LidoOracle.sol/LidoOracle.json'

import { LidoOracle } from '../../../typechain/LidoOracle'

import { EmergencyBrake } from '../../../typechain/EmergencyBrake'
import { Timelock } from '../../../typechain/Timelock'

const { deployContract } = waffle

/**
 * @dev This script deploys the LidoOracle
 *
 * It takes as inputs the governance and protocol json address files.
 * The protocol json address file is updated.
 * The Timelock and Cloak get ROOT access. Root access is removed from the deployer.
 * The Timelock gets access to governance functions.
 */

;(async () => {
  const developer = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
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
  const ROOT = await timelock.ROOT()

  let lidoOracle: LidoOracle
  if (protocol.get('lidoOracle') === undefined) {
      lidoOracle = (await deployContract(ownerAcc, LidoOracleArtifact, [WSTETH, STETH])) as LidoOracle
      console.log(`[LidoOracle, '${lidoOracle.address}'],`)
      verify(lidoOracle.address, [])
      protocol.set('lidoOracle', lidoOracle.address)
      fs.writeFileSync('./addresses/protocol.json', mapToJson(protocol), 'utf8')
  } else {
      lidoOracle = (await ethers.getContractAt('LidoOracle', protocol.get('lidoOracle') as string, ownerAcc)) as unknown as LidoOracle
  }
  if (!(await lidoOracle.hasRole(ROOT, timelock.address))) {
      await lidoOracle.grantRole(ROOT, timelock.address); console.log(`lidoOracle.grantRoles(ROOT, timelock)`)
      while (!(await lidoOracle.hasRole(ROOT, timelock.address))) { }
  }

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

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()

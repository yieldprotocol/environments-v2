import { ethers, waffle } from 'hardhat'
import * as hre from 'hardhat'
import * as fs from 'fs'
import { id } from '@yield-protocol/utils-v2'
import { mapToJson, jsonToMap, verify, proposeApproveExecute, getOwnerOrImpersonate } from '../../../shared/helpers'

import CompositeMultiOracleArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/oracles/composite/CompositeMultiOracle.sol/CompositeMultiOracle.json'

import { CompositeMultiOracle } from '../../../typechain/CompositeMultiOracle'

import { EmergencyBrake } from '../../../typechain/EmergencyBrake'
import { Timelock } from '../../../typechain/Timelock'

const { deployContract } = waffle

/**
 * @dev This script deploys the CompositeMultiOracles
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

  let compositeOracle: CompositeMultiOracle
  if (protocol.get('compositeOracle') === undefined) {
      compositeOracle = (await deployContract(ownerAcc, CompositeMultiOracleArtifact, [])) as CompositeMultiOracle
      console.log(`[CompositeMultiOracle, '${compositeOracle.address}'],`)
      verify(compositeOracle.address, [])
      protocol.set('compositeOracle', compositeOracle.address)
      fs.writeFileSync('./addresses/protocol.json', mapToJson(protocol), 'utf8')
  } else {
      compositeOracle = (await ethers.getContractAt('CompositeMultiOracle', protocol.get('compositeOracle') as string, ownerAcc)) as unknown as CompositeMultiOracle
  }
  if (!(await compositeOracle.hasRole(ROOT, timelock.address))) {
      await compositeOracle.grantRole(ROOT, timelock.address); console.log(`compositeOracle.grantRoles(ROOT, timelock)`)
      while (!(await compositeOracle.hasRole(ROOT, timelock.address))) { }
  }

  // Give access to each of the governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, revoke ROOT from the deployer
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
      target: compositeOracle.address,
      data: compositeOracle.interface.encodeFunctionData('grantRoles', [
          [
              id(compositeOracle.interface, 'setSource(bytes6,bytes6,address)'),
              id(compositeOracle.interface, 'setPath(bytes6,bytes6,bytes6[])'),
          ],
          timelock.address
      ])
  })
  console.log(`compositeOracle.grantRoles(gov, timelock)`)

  proposal.push({
      target: compositeOracle.address,
      data: compositeOracle.interface.encodeFunctionData('grantRole', [ROOT, cloak.address])
  })
  console.log(`compositeOracle.grantRole(ROOT, cloak)`)

  proposal.push({
      target: compositeOracle.address,
      data: compositeOracle.interface.encodeFunctionData('revokeRole', [ROOT, ownerAcc.address])
  })
  console.log(`compositeOracle.revokeRole(ROOT, deployer)`)

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()

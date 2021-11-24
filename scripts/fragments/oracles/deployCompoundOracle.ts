import { ethers, waffle } from 'hardhat'
import * as fs from 'fs'
import { mapToJson, jsonToMap, verify, getOwnerOrImpersonate } from '../../../shared/helpers'

import CompositeMultiOracleArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/oracles/compound/CompoundMultiOracle.sol/CompoundMultiOracle.json'

import { CompoundMultiOracle } from '../../../typechain/CompoundMultiOracle'
import { Timelock } from '../../../typechain/Timelock'

const { deployContract } = waffle

/**
 * @dev This script deploys the CompositeMultiOracles
 */

;(async () => {
  const developerIfImpersonating = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
  let ownerAcc = await getOwnerOrImpersonate(developerIfImpersonating)

  const protocol = jsonToMap(fs.readFileSync('./addresses/protocol.json', 'utf8')) as Map<string, string>
  const governance = jsonToMap(fs.readFileSync('./addresses/governance.json', 'utf8')) as Map<string, string>

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock
  const ROOT = await timelock.ROOT()

  let compoundOracle: CompoundMultiOracle
  if (protocol.get('compoundOracle') === undefined) {
      compoundOracle = (await deployContract(ownerAcc, CompositeMultiOracleArtifact, [])) as CompoundMultiOracle
      console.log(`CompoundMultiOracle deployed at ${compoundOracle.address}`)
      verify(compoundOracle.address, [])
      protocol.set('compoundOracle', compoundOracle.address)
      fs.writeFileSync('./addresses/protocol.json', mapToJson(protocol), 'utf8')
  } else {
      compoundOracle = (await ethers.getContractAt('CompoundMultiOracle', protocol.get('compoundOracle') as string, ownerAcc)) as unknown as CompoundMultiOracle
  }
  if (!(await compoundOracle.hasRole(ROOT, timelock.address))) {
      await compoundOracle.grantRole(ROOT, timelock.address); console.log(`compoundOracle.grantRoles(ROOT, timelock)`)
      while (!(await compoundOracle.hasRole(ROOT, timelock.address))) { }
  }
})()

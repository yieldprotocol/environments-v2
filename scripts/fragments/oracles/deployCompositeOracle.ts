import { ethers, waffle } from 'hardhat'
import * as fs from 'fs'
import { ROOT } from '../../../shared/constants'
import { mapToJson, jsonToMap, verify, proposeApproveExecute, getOwnerOrImpersonate } from '../../../shared/helpers'

import CompositeMultiOracleArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/oracles/composite/CompositeMultiOracle.sol/CompositeMultiOracle.json'

import { CompositeMultiOracle } from '../../../typechain/CompositeMultiOracle'
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
  const developerIfImpersonating = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
  let ownerAcc = await getOwnerOrImpersonate(developerIfImpersonating)

  const protocol = jsonToMap(fs.readFileSync('./addresses/protocol.json', 'utf8')) as Map<string, string>
  const governance = jsonToMap(fs.readFileSync('./addresses/governance.json', 'utf8')) as Map<string, string>

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

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
})()

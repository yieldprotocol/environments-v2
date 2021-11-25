import { ethers, waffle } from 'hardhat'
import * as fs from 'fs'
import { mapToJson, jsonToMap, verify, getOwnerOrImpersonate } from '../../../shared/helpers'
import { ROOT } from '../../../shared/constants'
import CompositeMultiOracleArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/oracles/chainlink/ChainlinkMultiOracle.sol/ChainlinkMultiOracle.json'

import { ChainlinkMultiOracle } from '../../../typechain/ChainlinkMultiOracle'
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

  let chainlinkOracle: ChainlinkMultiOracle
  if (protocol.get('chainlinkOracle') === undefined) {
      chainlinkOracle = (await deployContract(ownerAcc, CompositeMultiOracleArtifact, [])) as ChainlinkMultiOracle
      console.log(`ChainlinkMultiOracle deployed at ${chainlinkOracle.address}`)
      verify(chainlinkOracle.address, [])
      protocol.set('chainlinkOracle', chainlinkOracle.address)
      fs.writeFileSync('./addresses/protocol.json', mapToJson(protocol), 'utf8')
  } else {
      chainlinkOracle = (await ethers.getContractAt('ChainlinkMultiOracle', protocol.get('chainlinkOracle') as string, ownerAcc)) as unknown as ChainlinkMultiOracle
  }
  if (!(await chainlinkOracle.hasRole(ROOT, timelock.address))) {
      await chainlinkOracle.grantRole(ROOT, timelock.address); console.log(`chainlinkOracle.grantRoles(ROOT, timelock)`)
      while (!(await chainlinkOracle.hasRole(ROOT, timelock.address))) { }
  }
})()

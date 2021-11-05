import { ethers, waffle } from 'hardhat'
import * as fs from 'fs'
import { WSTETH, STETH } from '../../../shared/constants'
import { mapToJson, jsonToMap, verify, getOwnerOrImpersonate, bytesToBytes32 } from '../../../shared/helpers'

import LidoOracleArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/oracles/lido/LidoOracle.sol/LidoOracle.json'

import { LidoOracle } from '../../../typechain/LidoOracle'
import { Timelock } from '../../../typechain/Timelock'

const { deployContract } = waffle

/**
 * @dev This script deploys the LidoOracle
 *
 * It takes as inputs the governance and protocol json address files.
 * The protocol json address file is updated.
 * The Timelock gets ROOT access.
 */

;(async () => {
  const developerIfImpersonating = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
  let ownerAcc = await getOwnerOrImpersonate(developerIfImpersonating)

  const protocol = jsonToMap(fs.readFileSync('./addresses/protocol.json', 'utf8')) as Map<string, string>
  const governance = jsonToMap(fs.readFileSync('./addresses/governance.json', 'utf8')) as Map<string, string>

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock
  const ROOT = await timelock.ROOT()

  let lidoOracle: LidoOracle
  if (protocol.get('lidoOracle') === undefined) {
      lidoOracle = (await deployContract(ownerAcc, LidoOracleArtifact, [bytesToBytes32(WSTETH), bytesToBytes32(STETH)])) as LidoOracle
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
})()
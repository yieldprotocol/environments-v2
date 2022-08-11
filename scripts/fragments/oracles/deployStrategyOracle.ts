import { ethers, waffle } from 'hardhat'
import {
  getOriginalChainId,
  readAddressMappingIfExists,
  writeAddressMap,
  verify,
  getOwnerOrImpersonate,
  bytesToBytes32,
} from '../../../shared/helpers'
import { WSTETH, STETH } from '../../../shared/constants'
import { ROOT } from '../../../shared/constants'
import StrategyOracleArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/oracles/strategy/StrategyOracle.sol/StrategyOracle.json'

import { StrategyOracle } from '../../../typechain'
import { Timelock } from '../../../typechain'

const { deployContract } = waffle
const hre = require('hardhat')
/**
 * @dev This script deploys the StrategyOracle
 *
 * It takes as inputs the governance and protocol json address files.
 * The protocol json address file is updated.
 * The Timelock gets ROOT access.
 */
export const deployStrategyOracle = async (
  ownerAcc: any,
  timelock: Timelock,
  protocol: Map<string, string>
): Promise<StrategyOracle> => {
  let strategyOracle: StrategyOracle
  if (protocol.get('strategyOracle') === undefined) {
    strategyOracle = (await deployContract(ownerAcc, StrategyOracleArtifact)) as StrategyOracle
    console.log(`StrategyOracle deployed at ${strategyOracle.address}`)
    verify(strategyOracle.address, [])
    protocol.set('strategyOracle', strategyOracle.address)
    writeAddressMap('protocol.json', protocol)
    if (hre.network.name == 'tenderly') {
      await hre.tenderly.persistArtifacts({
        name: 'StrategyOracle',
        address: strategyOracle.address,
      })

      await hre.tenderly.verify({
        name: 'StrategyOracle',
        address: strategyOracle.address,
      })
    }
  } else {
    strategyOracle = (await ethers.getContractAt(
      'StrategyOracle',
      protocol.get('strategyOracle') as string,
      ownerAcc
    )) as unknown as StrategyOracle
    console.log(`Reusing StrategyOracle at ${strategyOracle.address}`)
  }
  if (!(await strategyOracle.hasRole(ROOT, timelock.address))) {
    await strategyOracle.grantRole(ROOT, timelock.address)
    console.log(`strategyOracle.grantRoles(ROOT, timelock)`)
    while (!(await strategyOracle.hasRole(ROOT, timelock.address))) {}
  }

  return strategyOracle
}

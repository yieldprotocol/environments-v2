import { ethers, waffle } from 'hardhat'
import { getOriginalChainId, readAddressMappingIfExists, writeAddressMap, verify, getOwnerOrImpersonate } from '../../../shared/helpers'
import { ROOT } from '../../../shared/constants'
import AccumulatorMultiOracleArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/oracles/accumulator/AccumulatorMultiOracle.sol/AccumulatorMultiOracle.json'

import { AccumulatorMultiOracle } from '../../../typechain/AccumulatorMultiOracle'
import { Timelock } from '../../../typechain/Timelock'

const { deployContract } = waffle

/**
 * @dev This script deploys the AccumulatorMultiOracle
 */
(async () => {
    const chainId = await getOriginalChainId()
    
    const developer = new Map([
      [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
      [4, '0xf1a6ffa6513d0cC2a5f9185c4174eFDb51ba3b13'],
      [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
    ])
  
    let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string)
    const protocol = readAddressMappingIfExists('protocol.json');
    const governance = readAddressMappingIfExists('governance.json');
  
    const timelock = (await ethers.getContractAt(
      'Timelock',
      governance.get('timelock') as string,
      ownerAcc
    )) as unknown as Timelock
  
    let accumulatorOracle: AccumulatorMultiOracle
    if (protocol.get('accumulatorOracle') === undefined) {
        accumulatorOracle = (await deployContract(ownerAcc, AccumulatorMultiOracleArtifact, [])) as AccumulatorMultiOracle
        console.log(`AccumulatorMultiOracle deployed at ${accumulatorOracle.address}`)
        verify(accumulatorOracle.address, [])
        protocol.set('accumulatorOracle', accumulatorOracle.address)
        writeAddressMap("protocol.json", protocol);
    } else {
        accumulatorOracle = (await ethers.getContractAt('AccumulatorMultiOracle', protocol.get('accumulatorOracle') as string, ownerAcc)) as unknown as AccumulatorMultiOracle
        console.log(`Reusing AccumulatorMultiOracle at ${accumulatorOracle.address}`)
    }
    if (!(await accumulatorOracle.hasRole(ROOT, timelock.address))) {
        await accumulatorOracle.grantRole(ROOT, timelock.address); console.log(`accumulatorOracle.grantRoles(ROOT, timelock)`)
        while (!(await accumulatorOracle.hasRole(ROOT, timelock.address))) { }
    }

})()

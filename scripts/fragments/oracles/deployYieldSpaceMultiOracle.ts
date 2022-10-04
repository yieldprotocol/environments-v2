import { ethers } from 'hardhat'
import { tenderlyVerify, verify, writeAddressMap } from '../../../shared/helpers'
import { POOL_ORACLE, ROOT, YIELD_SPACE_MULTI_ORACLE } from '../../../shared/constants'
import { Timelock, YieldSpaceMultiOracle, YieldSpaceMultiOracle__factory } from '../../../typechain'

/**
 * @dev This script deploys the YieldSpaceMultiOracle
 *
 * It takes as input the protocol json address files.
 * The protocol json address file is updated.
 */
export const deployYieldSpaceMultiOracle = async (
  ownerAcc: any,
  timelock: Timelock,
  protocol: Map<string, string>
): Promise<YieldSpaceMultiOracle> => {
  let yieldSpaceMultiOracle: YieldSpaceMultiOracle
  if (protocol.get(YIELD_SPACE_MULTI_ORACLE) === undefined) {
    const poolOracleAddress = protocol.get(POOL_ORACLE)!
    if ((await ethers.provider.getCode(poolOracleAddress)) === '0x')
      throw `Address ${poolOracleAddress} contains no code`

    yieldSpaceMultiOracle = await (
      await ethers.getContractFactory('YieldSpaceMultiOracle', ownerAcc)
    ).deploy(poolOracleAddress)
    console.log(`YieldSpaceMultiOracle deployed at ${yieldSpaceMultiOracle.address}`)
    verify(yieldSpaceMultiOracle.address, [poolOracleAddress])
    await tenderlyVerify('YieldSpaceMultiOracle', yieldSpaceMultiOracle)
    protocol.set(YIELD_SPACE_MULTI_ORACLE, yieldSpaceMultiOracle.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    yieldSpaceMultiOracle = YieldSpaceMultiOracle__factory.connect(protocol.get(YIELD_SPACE_MULTI_ORACLE)!, ownerAcc)
    console.log(`Reusing YieldSpaceMultiOracle at ${yieldSpaceMultiOracle.address}`)
  }

  if (!(await yieldSpaceMultiOracle.hasRole(ROOT, timelock.address))) {
    await yieldSpaceMultiOracle.grantRole(ROOT, timelock.address)
    console.log(`yieldSpaceMultiOracle.grantRoles(ROOT, timelock)`)
    while (!(await yieldSpaceMultiOracle.hasRole(ROOT, timelock.address))) {}
  }

  return yieldSpaceMultiOracle
}

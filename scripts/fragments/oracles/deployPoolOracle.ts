import { ethers } from 'hardhat'
import { verify, writeAddressMap } from '../../../shared/helpers'
import { POOL_ORACLE, secondsInOneHour, secondsInOneMinute } from '../../../shared/constants'
import { PoolOracle, PoolOracle__factory } from '../../../typechain'

/**
 * @dev This script deploys the PoolOracle
 *
 * It takes as input the protocol json address files.
 * The protocol json address file is updated.
 */
export const deployPoolOracle = async (ownerAcc: any, protocol: Map<string, string>): Promise<PoolOracle> => {
  let poolOracle: PoolOracle
  if (protocol.get(POOL_ORACLE) === undefined) {
    poolOracle = await (
      await ethers.getContractFactory('PoolOracle', ownerAcc)
    ).deploy(24 * secondsInOneHour, 24, 5 * secondsInOneMinute)
    console.log(`PoolOracle deployed at ${poolOracle.address}`)
    verify(poolOracle.address, [24 * secondsInOneHour, 24, 5 * secondsInOneMinute])
    protocol.set(POOL_ORACLE, poolOracle.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    poolOracle = PoolOracle__factory.connect(protocol.get(POOL_ORACLE)!, ownerAcc)
    console.log(`Reusing PoolOracle at ${poolOracle.address}`)
  }

  return poolOracle
}

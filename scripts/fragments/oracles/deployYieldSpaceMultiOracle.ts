import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers, waffle, artifacts } from 'hardhat'
import { ROOT, YIELDSPACE } from '../../../shared/constants'
import { verify, writeAddressMap } from '../../../shared/helpers'
import { Timelock, YieldSpaceMultiOracle } from '../../../typechain'
const { deployContract } = waffle

export const deployYieldSpaceMultiOracle = async (
  ownerAcc: SignerWithAddress,
  poolOracleAddress: string,
  timelock: Timelock,
  protocol: Map<string, string>,
) => {
  let yieldSpaceMultiOracle: YieldSpaceMultiOracle
  const address = protocol.get(YIELDSPACE)

  if (address === undefined) {

    yieldSpaceMultiOracle = await deployContract(ownerAcc, await artifacts.readArtifact('YieldSpaceMultiOracle'), [poolOracleAddress]) as YieldSpaceMultiOracle
    await yieldSpaceMultiOracle.deployed()
    console.log(`YieldSpaceMultiOracle deployed at ${yieldSpaceMultiOracle.address}`)
    protocol.set(YIELDSPACE, yieldSpaceMultiOracle.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    yieldSpaceMultiOracle = await ethers.getContractAt(
      'YieldSpaceMultiOracle',
      address,
      ownerAcc
    )
    console.log(`Reusing YieldSpaceMultiOracle at ${yieldSpaceMultiOracle.address}`)
  }
  await yieldSpaceMultiOracle.deployed()
  if (!(await yieldSpaceMultiOracle.hasRole(ROOT, timelock.address))) {
    await yieldSpaceMultiOracle.grantRole(ROOT, timelock.address)
    console.log(`yieldSpaceMultiOracle.grantRole(ROOT, timelock.address)`)
    while (!(await yieldSpaceMultiOracle.hasRole(ROOT, timelock.address))) {}
  }

  return yieldSpaceMultiOracle
}





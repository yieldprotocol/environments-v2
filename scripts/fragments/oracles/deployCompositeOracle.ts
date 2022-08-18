import { ethers } from 'hardhat'
import { ROOT } from '../../../shared/constants'
import { verify, writeAddressMap } from '../../../shared/helpers'
import { CompositeMultiOracle, Timelock } from '../../../typechain'

/**
 * @dev This script deploys the CompositeMultiOracles
 *
 * It takes as inputs the governance and protocol json address files.
 * The protocol json address file is updated.
 * The Timelock and Cloak get ROOT access. Root access is removed from the deployer.
 * The Timelock gets access to governance functions.
 */
export const deployCompositeOracle = async (
  ownerAcc: any,
  timelock: Timelock,
  protocol: Map<string, string>
): Promise<CompositeMultiOracle> => {
  let compositeOracle: CompositeMultiOracle
  if (protocol.get('compositeOracle') === undefined) {
    const _compositeOracle = await (await ethers.getContractFactory('CompositeMultiOracle')).deploy()
    compositeOracle = await _compositeOracle.deployed()
    console.log(`CompositeMultiOracle deployed at ${compositeOracle.address}`)
    verify(compositeOracle.address, [])
    protocol.set('compositeOracle', compositeOracle.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    compositeOracle = await ethers.getContractAt(
      'CompositeMultiOracle',
      protocol.get('compositeOracle') as string,
      ownerAcc
    )
    console.log(`Reusing CompositeMultiOracle at ${compositeOracle.address}`)
  }
  if (!(await compositeOracle.hasRole(ROOT, timelock.address))) {
    await compositeOracle.grantRole(ROOT, timelock.address)
    console.log(`compositeOracle.grantRoles(ROOT, timelock)`)
    while (!(await compositeOracle.hasRole(ROOT, timelock.address))) {}
  }

  return compositeOracle
}

import { ethers, waffle } from 'hardhat'
import { writeAddressMap, verify } from '../../../shared/helpers'
import { ROOT, NOTIONAL } from '../../../shared/constants'
import NotionalMultiOracleArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/other/notional/NotionalMultiOracle.sol/NotionalMultiOracle.json'
import { NotionalMultiOracle, Timelock } from '../../../typechain'

const { deployContract } = waffle

/**
 * @dev This script deploys the NotionalMultiOracle
 *
 * It takes as inputs the governance and protocol json address files.
 * The protocol json address file is updated.
 * The Timelock gets ROOT access.
 */
export const deployNotionalOracle = async (
  ownerAcc: any,
  timelock: Timelock,
  protocol: Map<string, string>
): Promise<NotionalMultiOracle> => {
  let notionalOracle: NotionalMultiOracle
  if (protocol.get(NOTIONAL) === undefined) {
    notionalOracle = (await deployContract(ownerAcc, NotionalMultiOracleArtifact, [])) as NotionalMultiOracle
    console.log(`NotionalMultiOracle deployed at ${notionalOracle.address}`)
    verify(notionalOracle.address, [])
    protocol.set(NOTIONAL, notionalOracle.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    notionalOracle = await ethers.getContractAt('NotionalMultiOracle', protocol.get(NOTIONAL) as string, ownerAcc)
    console.log(`Reusing NotionalMultiOracle at ${notionalOracle.address}`)
  }
  if (!(await notionalOracle.hasRole(ROOT, timelock.address))) {
    await notionalOracle.grantRole(ROOT, timelock.address)
    console.log(`notionalOracle.grantRoles(ROOT, timelock)`)
    while (!(await notionalOracle.hasRole(ROOT, timelock.address))) {}
  }

  return notionalOracle
}

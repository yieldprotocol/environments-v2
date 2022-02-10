import { ethers, waffle } from 'hardhat'
import {
  getOriginalChainId,
  getOwnerOrImpersonate,
  verify,
  writeAddressMap,
  readAddressMappingIfExists,
} from '../../../../shared/helpers'

import TimelockArtifact from '../../../../artifacts/@yield-protocol/utils-v2/contracts/utils/Timelock.sol/Timelock.json'
import { Timelock } from '../../../../typechain/Timelock'

const { deployContract } = waffle

/**
 * @dev This script deploys a Timelock
 *
 * It takes as inputs the governance json address file, which is updated.
 */
export const deployTimelock = async (ownerAcc: any, governance: Map<string, string>): Promise<Timelock> => {
  const multisig = governance.get('multisig') as string
  let timelock: Timelock
  if (governance.get('timelock') === undefined) {
    timelock = (await deployContract(ownerAcc, TimelockArtifact, [multisig, multisig])) as Timelock
    console.log(`Timelock deployed at ${timelock.address}`)
    verify(timelock.address, [ownerAcc.address, ownerAcc.address]) // Give the planner and executor their roles once set up

    governance.set('timelock', timelock.address)
    writeAddressMap('governance.json', governance)
  } else {
    timelock = (await ethers.getContractAt(
      'Timelock',
      governance.get('timelock') as string,
      ownerAcc
    )) as unknown as Timelock
    console.log(`Reusing Timelock at ${timelock.address}`)
  }

  return timelock
}

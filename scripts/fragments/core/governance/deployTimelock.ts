import { ethers, waffle } from 'hardhat'
import { getOriginalChainId, getOwnerOrImpersonate, verify, writeAddressMap, readAddressMappingIfExists } from '../../../../shared/helpers'

import TimelockArtifact from '../../../../artifacts/@yield-protocol/utils-v2/contracts/utils/Timelock.sol/Timelock.json'
import { Timelock } from '../../../../typechain/Timelock'

const { deployContract } = waffle

/**
 * @dev This script deploys a Timelock
 *
 * It takes as inputs the governance json address file, which is updated.
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (chainId !== 1 && chainId !== 42) throw 'Only Kovan and Mainnet supported'

  const developer = new Map([
    [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
    [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  ])

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string)
  const governance = readAddressMappingIfExists('governance.json');

  const multisig = ownerAcc.address

  let timelock: Timelock
  if (governance.get('timelock') === undefined) {
    timelock = (await deployContract(ownerAcc, TimelockArtifact, [multisig, multisig])) as Timelock
    console.log(`Timelock deployed at ${timelock.address}`)
    verify(timelock.address, [ownerAcc.address, ownerAcc.address]) // Give the planner and executor their roles once set up

    governance.set('timelock', timelock.address)
    writeAddressMap('governance.json', governance);
  } else {
    timelock = (await ethers.getContractAt(
      'Timelock',
      governance.get('timelock') as string,
      ownerAcc
    )) as unknown as Timelock
    console.log(`Reusing Timelock at ${timelock.address}`)
  }
})()

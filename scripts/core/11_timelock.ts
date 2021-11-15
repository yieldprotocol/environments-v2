import { ethers, waffle } from 'hardhat'
import * as hre from 'hardhat'
import * as fs from 'fs'
import { verify, writeAddressMap, readAddressMappingIfExists } from '../../shared/helpers'

import TimelockArtifact from '../../artifacts/@yield-protocol/utils-v2/contracts/utils/Timelock.sol/Timelock.json'
import { Timelock } from '../../typechain/Timelock'

const { deployContract } = waffle

/**
 * @dev This script deploys a Timelock
 *
 * It takes as inputs the governance json address file, which is updated.
 */

// const multisig = fs.readFileSync('.multisig', 'utf8').trim();
const governance = readAddressMappingIfExists('governance.json');

;(async () => {
  /* await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: ["0xA072f81Fea73Ca932aB2B5Eda31Fa29306D58708"],
  });
  const ownerAcc = await ethers.getSigner("0xA072f81Fea73Ca932aB2B5Eda31Fa29306D58708") */
  const [ownerAcc] = await ethers.getSigners()

  const multisig = ownerAcc.address
  const timelock = (await deployContract(ownerAcc, TimelockArtifact, [multisig, multisig])) as unknown as Timelock
  console.log(`[Timelock, '${timelock.address}'],`)
  verify(timelock.address, [multisig, multisig])

  governance.set('timelock', timelock.address);
  writeAddressMap("governance.json", governance);
})()

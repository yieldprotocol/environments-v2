/**
 * @dev This script executes an emergency plan from its hash.
 *
 * It takes as inputs the governance file.
 */

import { ethers } from 'hardhat'
import * as hre from 'hardhat'
import * as fs from 'fs'
import { jsonToMap } from '../../../shared/helpers'
;(async () => {
  const planHash = '0xae4831012f1830ace893417d820c13e4045d4039d192aff22b5d61ce840ea5af'
  /* await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: ["0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5"],
  });
  const ownerAcc = await ethers.getSigner("0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5") */
  const [ownerAcc] = await ethers.getSigners()
  const governance = jsonToMap(fs.readFileSync('./addresses/governance.json', 'utf8')) as Map<string, string>

  // Contract instantiation
  const cloak = await ethers.getContractAt('EmergencyBrake', governance.get('cloak') as string, ownerAcc)

  // Execute
  await cloak.execute(planHash)

  console.log(`Executed ${planHash}`)
})()

/**
 * @dev This script executes an emergency plan from its hash.
 * 
 * It takes as inputs the governance file.
 */

import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { jsonToMap } from '../shared/helpers'

import { EmergencyBrake } from '../typechain/EmergencyBrake'

(async () => {
  const planHash = '0xae4831012f1830ace893417d820c13e4045d4039d192aff22b5d61ce840ea5af'
  const [ ownerAcc ] = await ethers.getSigners();
  const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string, string>;

  // Contract instantiation
  const cloak = await ethers.getContractAt('EmergencyBrake', governance.get('cloak') as string, ownerAcc) as unknown as EmergencyBrake

  // Execute
  await cloak.execute(planHash)

  console.log(`Executed ${planHash}`)
  })()
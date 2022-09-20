import { ethers, waffle } from 'hardhat'
import { writeAddressMap, getOwnerOrImpersonate, verify } from '../../../shared/helpers'

import SolvencyArtifact from '../../../artifacts/contracts/Solvency.sol/Solvency.json'
const { protocol, governance, developer } = require(process.env.CONF as string)

const { deployContract } = waffle

/**
 * @dev This script deploys the Solvency contract
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)

  let solvency
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string)

  const ROOT = await timelock.ROOT()
  const cauldronAddress = protocol.get('cauldron') as string
  const ladleAddress = protocol.get('ladle') as string
  if (protocol.get('solvency') === undefined) {
    solvency = await deployContract(ownerAcc, SolvencyArtifact, [cauldronAddress, cauldronAddress, ladleAddress])
    console.log(`Solvency deployed at ${solvency.address}`)
    verify(solvency.address, [cauldronAddress, cauldronAddress, ladleAddress])
  } else {
    solvency = await ethers.getContractAt('Solvency', protocol.get('solvency') as string, ownerAcc)
    console.log(`Reusing Solvency at ${solvency.address}`)
  }

  const tx = await solvency.authorize(timelock.address)
  await tx.wait()

  if (!(await solvency.hasRole(ROOT, timelock.address))) {
    await solvency.grantRole(ROOT, timelock.address)
    console.log(`solvency.grantRoles(ROOT, timelock)`)
    while (!(await solvency.hasRole(ROOT, timelock.address))) {}
  }
  protocol.set('solvency', solvency.address)

  writeAddressMap('protocol.json', protocol)
})()

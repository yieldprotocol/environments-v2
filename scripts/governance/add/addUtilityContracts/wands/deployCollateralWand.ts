import { ethers, waffle } from 'hardhat'
import { getOwnerOrImpersonate, writeAddressMap, verify } from '../../../../../shared/helpers'

import CollateralWandArtifact from '../../../../../artifacts/contracts/wands/CollateralWand.sol/CollateralWand.json'
import { CollateralWand } from '../../../../../typechain'
import { ROOT } from '../../../../../shared/constants'
const { developer, deployer } = require(process.env.CONF as string)
const { protocol, governance } = require(process.env.CONF as string)
const { deployContract } = waffle

/**
 * @dev This script deploys the CollateralWand
 */

;async () => {
  let ownerAcc = await getOwnerOrImpersonate(deployer)
  const cauldron = protocol.get('cauldron') as string
  const ladle = protocol.get('ladle') as string
  const witch = protocol.get('witch') as string
  const chainlinkOracle = protocol.get('chainlinkOracle') as string
  const timelock = governance.get('timelock') as string
  const cloak = governance.get('cloak') as string
  let collateralWand: CollateralWand
  let args = [cauldron, ladle, witch, cloak, chainlinkOracle]
  if (protocol.get('collateralWand') === undefined) {
    collateralWand = (await deployContract(ownerAcc, CollateralWandArtifact, args)) as CollateralWand
    console.log(`CollateralWand deployed at ${collateralWand.address}`)
    verify(collateralWand.address, args)
    protocol.set('collateralWand', collateralWand.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    collateralWand = (await ethers.getContractAt(
      'CollateralWand',
      protocol.get('collateralWand') as string,
      ownerAcc
    )) as unknown as CollateralWand
    console.log(`Reusing CollateralWand at ${collateralWand.address}`)
  }

  if (!(await collateralWand.hasRole(ROOT, timelock))) {
    await collateralWand.grantRole(ROOT, timelock)
    console.log(`collateralWand.grantRoles(ROOT, timelock)`)
    while (!(await collateralWand.hasRole(ROOT, timelock))) {}
  }

  if (!(await collateralWand.hasRole(ROOT, deployer))) {
    await collateralWand.revokeRole(ROOT, deployer)
    console.log(`collateralWand.revokeRole(ROOT, deployer)`)
    while (!(await collateralWand.hasRole(ROOT, deployer))) {}
  }
  return collateralWand
}

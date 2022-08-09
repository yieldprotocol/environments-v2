import { ethers, waffle } from 'hardhat'
import { getOwnerOrImpersonate, writeAddressMap, verify } from '../../../../../shared/helpers'

import ChainlinkCollateralWandArtifact from '../../../../../artifacts/contracts/wands/ChainlinkCollateralWand.sol/ChainlinkCollateralWand.json'
import { ChainlinkCollateralWand } from '../../../../../typechain'
import { ROOT } from '../../../../../shared/constants'
const { developer, deployer } = require(process.env.CONF as string)
const { protocol, governance } = require(process.env.CONF as string)
const { deployContract } = waffle

/**
 * @dev This script deploys the CollateralWand
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(deployer)
  const cauldron = protocol.get('cauldron') as string
  const ladle = protocol.get('ladle') as string
  const witch = protocol.get('witch') as string
  const chainlinkOracle = protocol.get('chainlinkOracle') as string
  const timelock = governance.get('timelock') as string
  const cloak = governance.get('cloak') as string
  let collateralWand: ChainlinkCollateralWand
  let args = [cauldron, ladle, witch, cloak, chainlinkOracle]
  if (protocol.get('ChainlinkCollateralWand') === undefined) {
    collateralWand = (await deployContract(ownerAcc, ChainlinkCollateralWandArtifact, args)) as ChainlinkCollateralWand
    console.log(`CollateralWand deployed at ${collateralWand.address}`)
    verify(collateralWand.address, args)
    protocol.set('ChainlinkCollateralWand', collateralWand.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    collateralWand = (await ethers.getContractAt(
      'ChainlinkCollateralWand',
      protocol.get('ChainlinkCollateralWand') as string,
      ownerAcc
    )) as unknown as ChainlinkCollateralWand
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
})()

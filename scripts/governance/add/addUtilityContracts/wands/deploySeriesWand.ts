import { ethers, waffle } from 'hardhat'
import { getOwnerOrImpersonate, writeAddressMap, verify } from '../../../../../shared/helpers'

import SeriesWandArtifact from '../../../../../artifacts/contracts/wands/SeriesWand.sol/SeriesWand.json'
import { SeriesWand } from '../../../../../typechain'
import { ROOT } from '../../../../../shared/constants'
const { developer, deployer } = require(process.env.CONF as string)
const { protocol, governance } = require(process.env.CONF as string)
const { deployContract } = waffle

/**
 * @dev This script deploys the SeriesWand
 */

;async () => {
  let ownerAcc = await getOwnerOrImpersonate(deployer)
  const cauldron = protocol.get('cauldron') as string
  const ladle = protocol.get('ladle') as string
  const timelock = governance.get('timelock') as string
  const cloak = governance.get('cloak') as string
  let seriesWand: SeriesWand
  let args = [cauldron, ladle, cloak]
  if (protocol.get('seriesWand') === undefined) {
    seriesWand = (await deployContract(ownerAcc, SeriesWandArtifact, args)) as SeriesWand
    console.log(`seriesWand deployed at ${seriesWand.address}`)
    verify(seriesWand.address, args)
    protocol.set('seriesWand', seriesWand.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    seriesWand = (await ethers.getContractAt(
      'seriesWand',
      protocol.get('seriesWand') as string,
      ownerAcc
    )) as unknown as SeriesWand
    console.log(`Reusing seriesWand at ${seriesWand.address}`)
  }

  if (!(await seriesWand.hasRole(ROOT, timelock))) {
    await seriesWand.grantRole(ROOT, timelock)
    console.log(`seriesWand.grantRoles(ROOT, timelock)`)
    while (!(await seriesWand.hasRole(ROOT, timelock))) {}
  }

  if (!(await seriesWand.hasRole(ROOT, deployer))) {
    await seriesWand.revokeRole(ROOT, deployer)
    console.log(`seriesWand.revokeRole(ROOT, deployer)`)
    while (!(await seriesWand.hasRole(ROOT, deployer))) {}
  }
  return seriesWand
}

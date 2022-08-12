import { ethers, waffle } from 'hardhat'
import { getOwnerOrImpersonate, writeAddressMap, verify } from '../../../../../shared/helpers'

import FCashWandArtifact from '../../../../../artifacts/contracts/wands/fCashWand.sol/FCashWand.json'
import { FCashWand } from '../../../../../typechain'
import { ROOT } from '../../../../../shared/constants'
const { developer, deployer } = require(process.env.CONF as string)
const { protocol, governance } = require(process.env.CONF as string)
const { deployContract } = waffle

/**
 * @dev This script deploys the FCashWand
 */

;async () => {
  let ownerAcc = await getOwnerOrImpersonate(deployer)
  const cauldron = protocol.get('cauldron') as string
  const ladle = protocol.get('ladle') as string
  const witch = protocol.get('witch') as string
  const chainlinkOracle = protocol.get('chainlinkOracle') as string
  const timelock = governance.get('timelock') as string
  const cloak = governance.get('cloak') as string

  let fCashWand: FCashWand
  let args = [cauldron, ladle, witch, cloak, chainlinkOracle]
  if (protocol.get('fCashWand') === undefined) {
    fCashWand = (await deployContract(ownerAcc, FCashWandArtifact, args)) as FCashWand
    console.log(`FCashWand deployed at ${fCashWand.address}`)
    verify(fCashWand.address, args)
    protocol.set('fCashWand', fCashWand.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    fCashWand = (await ethers.getContractAt(
      'FCashWand',
      protocol.get('FCashWand') as string,
      ownerAcc
    )) as unknown as FCashWand
    console.log(`Reusing FCashWand at ${fCashWand.address}`)
  }

  if (!(await fCashWand.hasRole(ROOT, timelock))) {
    await fCashWand.grantRole(ROOT, timelock)
    console.log(`fCashWand.grantRoles(ROOT, timelock)`)
    while (!(await fCashWand.hasRole(ROOT, timelock))) {}
  }

  if (!(await fCashWand.hasRole(ROOT, deployer))) {
    await fCashWand.revokeRole(ROOT, deployer)
    console.log(`fCashWand.revokeRole(ROOT, deployer)`)
    while (!(await fCashWand.hasRole(ROOT, deployer))) {}
  }
  return fCashWand
}

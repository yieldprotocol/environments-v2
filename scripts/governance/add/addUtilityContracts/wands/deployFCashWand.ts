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

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(deployer)
  const cauldron = protocol.get('cauldron')
  const ladle = protocol.get('ladle')
  const witch = protocol.get('witch')
  const notionalOracle = protocol.get('notionalOracle')
  const timelock = governance.get('timelock')
  const cloak = governance.get('cloak')

  let fCashWand: FCashWand
  let args = [cauldron, ladle, witch, cloak, notionalOracle]
  console.log(`cauldron: ${cauldron}`)
  console.log(`ladle: ${ladle}`)
  console.log(`witch: ${witch}`)
  console.log(`notionalOracle: ${notionalOracle}`)
  console.log(`timelock: ${timelock}`)
  console.log(`cloak: ${cloak}`)

  if (protocol.get('fCashWand') === undefined) {
    fCashWand = (await deployContract(ownerAcc, FCashWandArtifact, args)) as FCashWand
    console.log(`FCashWand deployed at ${fCashWand.address}`)
    verify(fCashWand.address, args)
    protocol.set('fCashWand', fCashWand.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    fCashWand = await ethers.getContractAt('FCashWand', protocol.get('FCashWand') as string, ownerAcc)
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

  console.log(`completed`)

  return fCashWand
})()

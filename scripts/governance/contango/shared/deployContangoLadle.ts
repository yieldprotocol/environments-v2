import { ethers } from 'hardhat'
import { tenderlyVerify, verify } from '../../../../shared/helpers'
import { CONTANGO_LADLE, ROOT } from '../../../../shared/constants'

import { Ladle } from '../../../../typechain'

/**
 * @dev This script deploys the Ladle and with it the Router
 * The account to operate with needs to be passed as a parameter, as well as the WETH9 address to use.
 * The protocol and governance mappings are passed as paramters. In the future probably a context object will be passed instead.
 */

export const deployContangoLadle = async (
  ownerAcc: any,
  wethAddress: string,
  protocol: Map<string, string>,
  governance: Map<string, string>
): Promise<Ladle> => {
  console.log(`WETH address: ${wethAddress}`)

  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc)
  const cauldron = await ethers.getContractAt('Cauldron', protocol.get('contangoCauldron') as string, ownerAcc)
  const address = protocol.get(CONTANGO_LADLE)

  let contangoLadle: Ladle
  if (address === undefined) {
    const _ladle = await (await ethers.getContractFactory('ContangoLadle')).deploy(cauldron.address, wethAddress)
    contangoLadle = await _ladle.deployed()
    console.log(`Ladle deployed at ${contangoLadle.address}`)
    verify(contangoLadle.address, [cauldron.address, wethAddress])
    tenderlyVerify('ContangoLadle', contangoLadle)
    const router = await contangoLadle.router()
    console.log(`Router deployed at ${router}`)
    verify(router, [])
  } else {
    contangoLadle = await ethers.getContractAt('Ladle', address, ownerAcc)
    console.log(`Reusing Ladle at ${contangoLadle.address}`)
  }
  if (!(await contangoLadle.hasRole(ROOT, timelock.address))) {
    await contangoLadle.grantRole(ROOT, timelock.address)
    console.log(`ladle.grantRoles(ROOT, timelock)`)
    while (!(await contangoLadle.hasRole(ROOT, timelock.address))) {}
  }

  return contangoLadle
}

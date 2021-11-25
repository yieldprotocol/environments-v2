import { ethers, waffle } from 'hardhat'
import { verify } from '../../../shared/helpers'
import { ROOT } from '../../../shared/constants'

import LadleArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/Ladle.sol/Ladle.json'

import { WETH9Mock, Timelock, Cauldron, Ladle } from '../../../typechain'

const { deployContract } = waffle

/**
 * @dev This script deploys the Ladle and with it the Router
 */

export const deployLadle = async (
    ownerAcc: any,
    weth9: WETH9Mock,
    timelock: Timelock,
    cauldron: Cauldron,

  ): Promise<Ladle> => {
  console.log(`Using ${await weth9.name()} at ${weth9.address}`)

  const ladle = (await deployContract(ownerAcc, LadleArtifact, [cauldron.address, weth9.address])) as Ladle
  console.log(`Ladle deployed at ${ladle.address}`)
  verify(ladle.address, [cauldron.address, weth9.address])

  const router = await ladle.router()
  console.log(`Router deployed at ${router}`)
  verify(router, [])

  if (!(await ladle.hasRole(ROOT, timelock.address))) {
    await ladle.grantRole(ROOT, timelock.address)
    console.log(`ladle.grantRoles(ROOT, timelock)`)
    while (!(await ladle.hasRole(ROOT, timelock.address))) {}
  }

  return ladle
}

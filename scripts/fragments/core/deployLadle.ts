import { ethers, waffle } from 'hardhat'
import { getOriginalChainId, readAddressMappingIfExists, writeAddressMap, verify } from '../../../shared/helpers'
import { ROOT } from '../../../shared/constants'

import LadleArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/Ladle.sol/Ladle.json'

import { WETH9Mock, Timelock, Cauldron, Ladle } from '../../../typechain'

const { deployContract } = waffle

/**
 * @dev This script deploys the Ladle and with it the Router
 * The account to operate with needs to be passed as a parameter, as well as the WETH9 address to use.
 * The protocol and governance mappings are read from file. In the future probably a context object will be passed instead.
 */

export const deployLadle = async (
    ownerAcc: any,
    weth9: WETH9Mock,
  ): Promise<Ladle> => {
  console.log(`Using ${await weth9.name()} at ${weth9.address}`)

  const chainId = await getOriginalChainId()
  if (chainId !== 1 && chainId !== 42) throw 'Only Kovan and Mainnet supported'

  const protocol = readAddressMappingIfExists('protocol.json');
  const governance = readAddressMappingIfExists('governance.json');

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock
  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    governance.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron

  let ladle: Ladle
  if (protocol.get('ladle') === undefined) {
    ladle = (await deployContract(ownerAcc, LadleArtifact, [cauldron.address, weth9.address])) as Ladle
    console.log(`Ladle deployed at ${ladle.address}`)
    verify(ladle.address, [])
    protocol.set('ladle', ladle.address)

    const router = await ladle.router()
    console.log(`Router deployed at ${router}`)
    verify(router, [])
    protocol.set('router', router)

    writeAddressMap('protocol.json', protocol);
  } else {
    ladle = (await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as Ladle
    console.log(`Reusing Ladle at ${ladle.address}`)
  }
  if (!(await ladle.hasRole(ROOT, timelock.address))) {
    await ladle.grantRole(ROOT, timelock.address)
    console.log(`ladle.grantRoles(ROOT, timelock)`)
    while (!(await ladle.hasRole(ROOT, timelock.address))) {}
  }

  return ladle
}

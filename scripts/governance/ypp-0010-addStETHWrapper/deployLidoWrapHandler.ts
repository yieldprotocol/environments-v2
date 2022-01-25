import { ethers, waffle } from 'hardhat'
import { WSTETH, STETH } from '../../../shared/constants'
import { getOriginalChainId, getOwnerOrImpersonate, readAddressMappingIfExists, writeAddressMap, verify } from '../../../shared/helpers'

import LidoWrapHandlerArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/utils/LidoWrapHandler.sol/LidoWrapHandler.json'
import { LidoWrapHandler, Cauldron } from '../../../typechain'
import { developer } from './addStETHWrapper.config'

const { deployContract } = waffle

/**
 * @dev This script deploys the LidoWrapHandler
 */

 ;(async () => {
  const chainId = await getOriginalChainId()

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string)
  const protocol = readAddressMappingIfExists('protocol.json');

  const cauldron = (await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc)) as unknown as Cauldron
  const wstEthAddress = await cauldron.assets(WSTETH)
  const stEthAddress = await cauldron.assets(STETH)
  console.log(`Using wstETH at ${wstEthAddress}`)
  console.log(`Using stETH at ${stEthAddress}`)

  let lidoWrapHandler: LidoWrapHandler
  if (protocol.get('lidoWrapHandler') === undefined) {
      lidoWrapHandler = (await deployContract(ownerAcc, LidoWrapHandlerArtifact, [wstEthAddress, stEthAddress])) as LidoWrapHandler
      console.log(`LidoWrapHandler deployed at ${lidoWrapHandler.address}`)
      verify(lidoWrapHandler.address, [wstEthAddress, stEthAddress])
      protocol.set('lidoWrapHandler', lidoWrapHandler.address)
      writeAddressMap('protocol.json', protocol);
  } else {
      lidoWrapHandler = (await ethers.getContractAt('LidoWrapHandler', protocol.get('lidoWrapHandler') as string, ownerAcc)) as unknown as LidoWrapHandler
      console.log(`Reusing LidoWrapHandler at ${lidoWrapHandler.address}`)
  }
  return lidoWrapHandler
})()
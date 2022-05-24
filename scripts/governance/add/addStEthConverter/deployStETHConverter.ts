import { ethers, waffle } from 'hardhat'
import { WSTETH, STETH } from '../../../../shared/constants'
import { getOwnerOrImpersonate, writeAddressMap, verify } from '../../../../shared/helpers'

import StEthConverterArtifact from '../../../../artifacts/@yield-protocol/vault-v2/contracts/other/lido/StEthConverter.sol/StEthConverter.json'
import { StEthConverter } from '../../../../typechain'
const { developer, protocol, assets } = require(process.env.CONF as string)

const { deployContract } = waffle

/**
 * @dev This script deploys the StEthConverter
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const wstEthAddress = assets.get(WSTETH) as string
  const stEthAddress = assets.get(STETH) as string
  console.log(`Using wstETH at ${wstEthAddress}`)
  console.log(`Using stETH at ${stEthAddress}`)

  let stEthConverter: StEthConverter
  if (protocol.get('stEthConverter') === undefined) {
    stEthConverter = (await deployContract(ownerAcc, StEthConverterArtifact, [
      wstEthAddress,
      stEthAddress,
    ])) as StEthConverter
    console.log(`StEthConverter deployed at ${stEthConverter.address}`)
    verify(stEthConverter.address, [wstEthAddress, stEthAddress])
    protocol.set('stEthConverter', stEthConverter.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    stEthConverter = (await ethers.getContractAt(
      'StEthConverter',
      protocol.get('stEthConverter') as string,
      ownerAcc
    )) as unknown as StEthConverter
    console.log(`Reusing StEthConverter at ${stEthConverter.address}`)
  }
})()

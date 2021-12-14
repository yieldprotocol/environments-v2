import { ethers } from 'hardhat'
import { readAddressMappingIfExists, writeAddressMap, getOwnerOrImpersonate, getOriginalChainId } from '../../../shared/helpers'

import { deployJoin } from '../../fragments/assetsAndSeries/deployJoin'

import { ERC20Mock } from '../../../typechain'
import { developer, assetsToAdd } from './addMKR.rinkeby.config'

/**
 * @dev This script deploys a Join
 */

;(async () => {
  const chainId = await getOriginalChainId()

  let ownerAcc = await getOwnerOrImpersonate(developer)
  const protocol = readAddressMappingIfExists('protocol.json');
  const joins = readAddressMappingIfExists('joins.json');
  const governance = readAddressMappingIfExists('governance.json');

  for (let [assetId, assetAddress] of assetsToAdd) {
    if ((await ethers.provider.getCode(assetAddress)) === '0x') throw `Address ${assetAddress} contains no code`    
    const asset = (await ethers.getContractAt(
      'ERC20Mock',
      assetAddress,
      ownerAcc
    )) as unknown as ERC20Mock
    console.log(`Using ${await asset.name()} asset at ${assetAddress}`)

    const join = await deployJoin(ownerAcc, asset, protocol, governance)
    console.log(`Join for ${asset.address} deployed at ${join.address}`)

    joins.set(assetId, asset.address)
    writeAddressMap('joins.json', joins);
  }
})()

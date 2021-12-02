import { ethers } from 'hardhat'
import { readAddressMappingIfExists, getOwnerOrImpersonate, bytesToBytes32, impersonate, getOriginalChainId } from '../../../shared/helpers'
import { CompositeMultiOracle } from '../../../typechain'
import { ETH, DAI, USDC, WBTC, WSTETH, STETH, LINK, ENS, WAD } from '../../../shared/constants'
import { developer } from './addCompositeSources.config'

/**
 * @dev This script tests the composite oracle as the source for all price feeds
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (!(chainId === 1 || chainId === 4 || chainId === 42)) throw "Only Kovan, Rinkeby and Mainnet supported"
  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string)

  const protocol = readAddressMappingIfExists('protocol.json');

  const oracle = (await ethers.getContractAt(
    'CompositeMultiOracle',
    protocol.get('compositeOracle') as string,
    ownerAcc
  )) as unknown as CompositeMultiOracle

  for (let baseId of [ETH, DAI, USDC]) {
    for (let quoteId of [ETH, DAI, USDC, WBTC, WSTETH, STETH, LINK, ENS]) {
      console.log(`${baseId}/${quoteId}:`)
      console.log(`  ${await oracle.peek(bytesToBytes32(baseId), bytesToBytes32(quoteId), WAD)}`)
    }
  }
})()

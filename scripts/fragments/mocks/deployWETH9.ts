import { ethers, waffle } from 'hardhat'
import { verify, getOriginalChainId, getOwnerOrImpersonate } from '../../../shared/helpers'
import WETH9MockArtifact from '../../../artifacts/contracts/mocks/WETH9Mock.sol/WETH9Mock.json'

import { WETH9Mock } from '../../../typechain/WETH9Mock'
const { deployContract } = waffle

/**
 * @dev This script deploys a WETH9 Mock
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (!(chainId === 1 || chainId === 4 || chainId === 42)) throw 'Only Rinkeby, Kovan and Mainnet supported'

  const developer = new Map([
    [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
    [4, '0xf1a6ffa6513d0cC2a5f9185c4174eFDb51ba3b13'],
    [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  ])

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string)

  const args: any = []
  const asset = (await deployContract(ownerAcc, WETH9MockArtifact, args)) as unknown as WETH9Mock
  await asset.deployed()
  console.log(`${await asset.symbol()} deployed at ${asset.address}`)
  verify(asset.address, args)
})()

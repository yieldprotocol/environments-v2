import { ethers, waffle } from 'hardhat'
import { verify, getOriginalChainId, getOwnerOrImpersonate } from '../../../shared/helpers'
import DaiMockArtifact from '../../../artifacts/contracts/mocks/DaiMock.sol/DaiMock.json'

import { DaiMock } from '../../../typechain/DaiMock'
const { deployContract } = waffle

/**
 * @dev This script deploys a Dai Mock
 */

;(async () => {
  const chainId = await getOriginalChainId()

  const developer = new Map([
    [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
    [4, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
    [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  ])

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string)

  const args: any = []
  const asset = (await deployContract(ownerAcc, DaiMockArtifact, args)) as unknown as DaiMock
  await asset.deployed()
  console.log(`${await asset.symbol()} deployed at ${asset.address}`)
  verify(asset.address, args)
})()

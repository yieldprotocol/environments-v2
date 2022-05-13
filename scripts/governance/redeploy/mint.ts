import { ethers, waffle } from 'hardhat'
import {
  getOriginalChainId,
  getOwnerOrImpersonate,
  readAddressMappingIfExists,
  verify,
  writeAddressMap,
} from '../../../shared/helpers'

import { ERC20Mock } from '../../../typechain/ERC20Mock'
const { deployContract } = waffle
const { developer, assets } = require(process.env.CONF as string)
/**
 * @dev This script deploys a USDC Mock
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)
  const protocol = readAddressMappingIfExists('protocol.json')
  let usdcMock: ERC20Mock

  for (let [assetId, assetAddress] of assets) {
    usdcMock = (await ethers.getContractAt(
      'contracts/::mocks/ERC20Mock.sol:ERC20Mock',
      assetAddress,
      ownerAcc
    )) as unknown as ERC20Mock

    await usdcMock.mint('0x1Bd3Abb6ef058408734EA01cA81D325039cd7bcA', ethers.utils.parseEther('1000000'))
  }
  //   usdcMock = (await ethers.getContractAt(
  //     'contracts/::mocks/ERC20Mock.sol:ERC20Mock',
  //     protocol.get('usdcMock') as string,
  //     ownerAcc
  //   )) as unknown as ERC20Mock
  // console.log(ethers.utils.parseEther('10000'))
  //   await usdcMock.mint('0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5', ethers.utils.parseEther('10000'))
  //   usdcMock = (await ethers.getContractAt(
  //     'contracts/::mocks/ERC20Mock.sol:ERC20Mock',
  //     protocol.get('fraxMock') as string,
  //     ownerAcc
  //   )) as unknown as ERC20Mock
  //   await usdcMock.mint('0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5', ethers.utils.parseEther('10000'))

  //   usdcMock = (await ethers.getContractAt(
  //     'contracts/::mocks/ERC20Mock.sol:ERC20Mock',
  //     protocol.get('daiMock') as string,
  //     ownerAcc
  //   )) as unknown as ERC20Mock
  //   await usdcMock.mint('0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5', ethers.utils.parseEther('10000'))
})()

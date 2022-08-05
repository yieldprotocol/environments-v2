import { ethers, waffle } from 'hardhat'
import { readAddressMappingIfExists, verify, writeAddressMap } from '../../../../../../../shared/helpers'

import YvTokenMockArtifact from '../../../../../../../artifacts/contracts/::mocks/YvTokenMock.sol/YvTokenMock.json'
import { YvTokenMock } from '../../../../../../../typechain/YvTokenMock'

import { USDC } from '../../../../../../../shared/constants'
// import { assets } from './../addYVUSDC.kovan.config'

const { deployContract } = waffle
const { protocol, assets } = require(process.env.CONF as string)
/**
 * @dev This script deploys the YvTokenMock contract
 * @notice Not used for mainnet
 */

;(async () => {
  const [ownerAcc] = await ethers.getSigners()

  let yvUSDC: YvTokenMock
  const args = ['USDC yVault', 'yvUSDC', 6, assets.get(USDC) as string]
  if (protocol.get('yvUSDCMock') === undefined) {
    yvUSDC = (await deployContract(ownerAcc, YvTokenMockArtifact, args)) as YvTokenMock
    console.log(`YvUSDCMock, '${yvUSDC.address}`)
    verify(yvUSDC.address, args)
    protocol.set('yvUSDCMock', yvUSDC.address)
    writeAddressMap('protocol.json', protocol)
    await yvUSDC.set(1089925)
  } else {
    yvUSDC = (await ethers.getContractAt(
      'YvTokenMock',
      protocol.get('yvUSDCMock') as string,
      ownerAcc
    )) as unknown as YvTokenMock
    console.log(`Reusing YvUSDCMock at ${yvUSDC.address}`)
  }
})()

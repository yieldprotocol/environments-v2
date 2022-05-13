import { ethers, waffle } from 'hardhat'
import {
  getOriginalChainId,
  readAddressMappingIfExists,
  verify,
  writeAddressMap,
} from '../../../../../../../shared/helpers'

import CurvePoolMockArtifact from '../../../../../../../artifacts/contracts/mocks/CurvePoolMock.sol/CurvePoolMock.json'
import { CurvePoolMock } from '../../../../../../../typechain/CurvePoolMock'

const { deployContract } = waffle

/**
 * @dev This script deploys the CurvePoolMock contract
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (chainId === 1) throw "You shouldn't deploy ConvexPoolMock on mainnet"
  const [ownerAcc] = await ethers.getSigners()
  const protocol = readAddressMappingIfExists('protocol.json')
  let curvePoolMock: CurvePoolMock
  if (protocol.get('curvePoolMock') === undefined) {
    curvePoolMock = (await deployContract(ownerAcc, CurvePoolMockArtifact)) as CurvePoolMock
    console.log(`CurvePoolMock deployed at '${curvePoolMock.address}`)
    verify(curvePoolMock.address, [])
    protocol.set('curvePoolMock', curvePoolMock.address)
    writeAddressMap('protocol.json', protocol)
    await curvePoolMock.set('1019568078072415210')
  } else {
    curvePoolMock = (await ethers.getContractAt(
      'CurvePoolMock',
      protocol.get('curvePoolMock') as string,
      ownerAcc
    )) as unknown as CurvePoolMock
    console.log(`Reusing curvePoolMock at ${curvePoolMock.address}`)
  }
})()

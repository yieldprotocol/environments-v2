import { ethers, waffle } from 'hardhat'
import {
  verify,
  getOriginalChainId,
  getOwnerOrImpersonate,
  readAddressMappingIfExists,
  writeAddressMap,
} from '../../../shared/helpers'
import WBTCMockArtifact from '../../../artifacts/contracts/::mocks/WBTCMock.sol/WBTCMock.json'

import { WBTCMock } from '../../../typechain/WBTCMock'
const { deployContract } = waffle
const { developer } = require(process.env.CONF as string)
/**
 * @dev This script deploys a WBTC Mock
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const chainId = await getOriginalChainId()
  if (chainId === 1) throw "You shouldn't deploy DaiMock on mainnet"

  const protocol = readAddressMappingIfExists('protocol.json')
  let wbtcMock: WBTCMock

  if (protocol.get('wbtcMock') === undefined) {
    wbtcMock = (await deployContract(ownerAcc, WBTCMockArtifact)) as WBTCMock
    console.log(`wbtcMock deployed at '${wbtcMock.address}`)
    //Write the address to the file
    verify(wbtcMock.address, [])
    protocol.set('wbtcMock', wbtcMock.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    wbtcMock = (await ethers.getContractAt(
      'WBTCMock',
      protocol.get('wbtcMock') as string,
      ownerAcc
    )) as unknown as WBTCMock
    console.log(`Reusing wbtcMock at ${wbtcMock.address}`)
  }
})()

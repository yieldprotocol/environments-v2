import { ethers, waffle } from 'hardhat'
import {
  getOriginalChainId,
  readAddressMappingIfExists,
  writeAddressMap,
  verify,
  getOwnerOrImpersonate,
  bytesToBytes32,
} from '../../../shared/helpers'
import { ROOT } from '../../../shared/constants'
import YvBasicFlashLiquidatorArtifact from '../../../artifacts/@yield-protocol/yield-liquidator-v2/contracts/YvBasicFlashLiquidator.sol/YvBasicFlashLiquidator.json'

import { YvBasicFlashLiquidator } from '../../../typechain'

const { deployContract } = waffle

/**
 * @dev This script deploys the Yearn (Basic) Flash Liquidator
 *
 * It takes as inputs the governance and protocol json address files.
 * The protocol json address file is updated.
 * The Timelock gets ROOT access.
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (!(chainId === 1 || chainId === 4 || chainId === 42)) throw 'Only Rinkeby, Kovan and Mainnet supported'

  const developer = new Map([
    [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
    [4, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
    [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  ])

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string)
  const protocol = readAddressMappingIfExists('protocol.json')
  const governance = readAddressMappingIfExists('governance.json')
  const swapRouter = '0xE592427A0AEce92De3Edee1F18E0157C05861564'
  const factory = '0x1F98431c8aD98523631AE4a59f267346ea31F984'

  let flashLiquidator: YvBasicFlashLiquidator
  if (protocol.get('yvBasicFlashLiquidator') === undefined) {
    flashLiquidator = (await deployContract(ownerAcc, YvBasicFlashLiquidatorArtifact, [
        protocol.get('witch'),
        factory,
        swapRouter

    ])) as YvBasicFlashLiquidator
    console.log(`YvBasicFlashLiquidator deployed at ${flashLiquidator.address}`)
    verify(flashLiquidator.address, [
        protocol.get('witch'),
        factory,
        swapRouter

    ])
    protocol.set('yvBasicFlashLiquidator', flashLiquidator.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    flashLiquidator = (await ethers.getContractAt(
      'YvBasicFlashLiquidator',
      protocol.get('yvBasicFlashLiquidator') as string,
      ownerAcc
    )) as unknown as YvBasicFlashLiquidator
    console.log(`Reusing YvBasicFlashLiquidator at ${flashLiquidator.address}`)
  }
})()

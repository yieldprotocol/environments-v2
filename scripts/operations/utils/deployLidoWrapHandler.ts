import { ethers, waffle } from 'hardhat'
import * as fs from 'fs'
import { WSTETH, STETH } from '../../../shared/constants'
import { mapToJson, jsonToMap, verify, getOwnerOrImpersonate, getOriginalChainId } from '../../../shared/helpers'

import LidoWrapHandlerArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/utils/LidoWrapHandler.sol/LidoWrapHandler.json'

import { LidoWrapHandler } from '../../../typechain'

const { deployContract } = waffle

/**
 * @dev This script deploys the LidoWrapHandler
 *
 * It takes as inputs the assets and protocol json address files.
 * The protocol json address file is updated.
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (chainId !== 1 && chainId !== 42) throw "Only Kovan and Mainnet supported"
  const path = chainId === 1 ? './addresses/mainnet/' : './addresses/kovan/'

  const developer = new Map([
    [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
    [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  ])

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string)

  const protocol = jsonToMap(fs.readFileSync(path + 'protocol.json', 'utf8')) as Map<string, string>
  const assets = jsonToMap(fs.readFileSync(path + 'assets.json', 'utf8')) as Map<string, string>

  const wstEthAddress = assets.get(WSTETH) as string
  const stEthAddress = assets.get(STETH) as string

  let lidoWrapHandler: LidoWrapHandler
  if (protocol.get('lidoWrapHandler') === undefined) {
      lidoWrapHandler = (await deployContract(ownerAcc, LidoWrapHandlerArtifact, [wstEthAddress, stEthAddress])) as LidoWrapHandler
      console.log(`[LidoWrapHandler, '${lidoWrapHandler.address}'],`)
      verify(lidoWrapHandler.address, [wstEthAddress, stEthAddress])
      protocol.set('lidoWrapHandler', lidoWrapHandler.address)
      fs.writeFileSync(path + 'protocol.json', mapToJson(protocol), 'utf8')
  } else {
      lidoWrapHandler = (await ethers.getContractAt('LidoWrapHandler', protocol.get('lidoWrapHandler') as string, ownerAcc)) as unknown as LidoWrapHandler
  }
})()
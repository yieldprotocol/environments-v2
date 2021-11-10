import { ethers, waffle } from 'hardhat'
import * as fs from 'fs'
import { WSTETH, STETH } from '../../../shared/constants'
import { mapToJson, jsonToMap, verify, getOwnerOrImpersonate, bytesToBytes32 } from '../../../shared/helpers'

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
  const developerIfImpersonating = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
  let ownerAcc = await getOwnerOrImpersonate(developerIfImpersonating)

  const assets = jsonToMap(fs.readFileSync('./addresses/assets.json', 'utf8')) as Map<string, string>
  const protocol = jsonToMap(fs.readFileSync('./addresses/protocol.json', 'utf8')) as Map<string, string>

  const wstEthAddress = assets.get(WSTETH) as string
  const stEthAddress = assets.get(STETH) as string

  let lidoWrapHandler: LidoWrapHandler
  if (protocol.get('lidoWrapHandler') === undefined) {
      lidoWrapHandler = (await deployContract(ownerAcc, LidoWrapHandlerArtifact, [wstEthAddress, stEthAddress])) as LidoWrapHandler
      console.log(`[LidoWrapHandler, '${lidoWrapHandler.address}'],`)
      verify(lidoWrapHandler.address, [wstEthAddress, stEthAddress])
      protocol.set('lidoWrapHandler', lidoWrapHandler.address)
      fs.writeFileSync('./addresses/protocol.json', mapToJson(protocol), 'utf8')
  } else {
      lidoWrapHandler = (await ethers.getContractAt('LidoWrapHandler', protocol.get('lidoWrapHandler') as string, ownerAcc)) as unknown as LidoWrapHandler
  }
})()
import { ethers } from 'hardhat'
import * as fs from 'fs'
import { jsonToMap, proposeApproveExecute, getOwnerOrImpersonate, getOriginalChainId } from '../../../../shared/helpers'

import { addAssetProposal } from '../../addAssetProposal'
import { Wand, Timelock } from '../../../../typechain'
import { ENS, WAD } from '../../../../shared/constants'

/**
 * @dev This script adds ENS as an asset to the Yield Protocol.
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (chainId !== 1 && chainId !== 42) throw "Only Kovan and Mainnet supported"
  const path = chainId === 1 ? './addresses/mainnet/' : './addresses/kovan/'

  const ensAddress = new Map([
    [1, '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72'],
    [42, '0xA24b97c7617cc40dCc122F6dF813584A604a6C28'],
  ]) // https://ens.mirror.xyz/5cGl-Y37aTxtokdWk21qlULmE1aSM_NuX9fstbOPoWU
  
  const addedAssets: Array<[string, string]> = [
    [ENS, ensAddress.get(chainId) as string],
  ]
  const developer = new Map([
    [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
    [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  ])

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string)

  const protocol = jsonToMap(fs.readFileSync(path + 'protocol.json', 'utf8')) as Map<string, string>
  const governance = jsonToMap(fs.readFileSync(path + 'governance.json', 'utf8')) as Map<string, string>

  const wand = (await ethers.getContractAt(
    'Wand',
    protocol.get('wand') as string,
    ownerAcc
  )) as unknown as Wand
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  let proposal = await addAssetProposal(ownerAcc, wand, addedAssets)

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()

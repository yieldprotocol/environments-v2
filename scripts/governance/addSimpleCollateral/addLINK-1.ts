import { ethers } from 'hardhat'
import { readAddressMappingIfExists, getOriginalChainId, proposeApproveExecute, getOwnerOrImpersonate } from '../../../shared/helpers'

import { addAssetProposal } from '../../fragments/assetsAndSeries/addAssetProposal'
import { Wand, Timelock } from '../../../typechain'
import { LINK } from '../../../shared/constants'

/**
 * @dev This script adds LINK as an asset.
 */

;(async () => {
  const developerIfImpersonating = new Map([
    [1,'0xC7aE076086623ecEA2450e364C838916a043F9a8'],
    [42,'0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5']
  ])

  const chainId = await getOriginalChainId()
  if (chainId !== 1 && chainId !== 42) throw "Only Kovan and Mainnet supported"

  let ownerAcc = await getOwnerOrImpersonate(developerIfImpersonating.get(chainId) as string)

  const protocol = readAddressMappingIfExists('protocol.json');
  const governance = readAddressMappingIfExists('governance.json');

  const linkAddress = new Map([
    [1, '0x514910771af9ca656af840dff83e8264ecf986ca'],
    [42, '0xe37c6209C44d89c452A422DDF3B71D1538D58b96'],
  ]) // https://docs.chain.link/docs/link-token-contracts/

  const addedAssets: Array<[string, string]> = [
    [LINK, linkAddress.get(chainId) as string],
  ]

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

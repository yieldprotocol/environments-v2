import { ethers } from 'hardhat'
import { readAddressMappingIfExists, getOriginalChainId, proposeApproveExecute, getOwnerOrImpersonate } from '../../../shared/helpers'

import { updateCompositeSourcesProposal } from '../../fragments/oracles/updateCompositeSourcesProposal'
import { CompositeMultiOracle, Timelock } from '../../../typechain'
import { developer, compositeSources } from './addCompositeSources.config'

/**
 * @dev This script adds as an asset.
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (!(chainId === 1 || chainId === 4 || chainId === 42)) throw "Only Kovan, Rinkeby and Mainnet supported"

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string)

  const protocol = readAddressMappingIfExists('protocol.json');
  const governance = readAddressMappingIfExists('governance.json');

  const compositeOracle = ((await ethers.getContractAt(
    'CompositeMultiOracle',
    protocol.get('compositeOracle') as string,
    ownerAcc
  )) as unknown) as CompositeMultiOracle
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  let proposal = await updateCompositeSourcesProposal(
    compositeOracle,
    compositeSources.get(chainId) as Array<[string, string, string]>
  )

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()

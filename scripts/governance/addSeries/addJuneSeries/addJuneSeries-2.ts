import { ethers } from 'hardhat'
import { readAddressMappingIfExists, writeAddressMap, getOwnerOrImpersonate, getOriginalChainId, proposeApproveExecute, verify } from '../../../../shared/helpers'

import { updatePoolFeesProposal } from '../../../fragments/core/factories/updatePoolFeesProposal'
import { updateTimeStretchProposal } from '../../../fragments/core/factories/updateTimeStretchProposal'
import { orchestratePoolFactoryProposal } from '../../../fragments/core/factories/orchestratePoolFactoryProposal'
import { deployPoolsProposal } from '../../../fragments/assetsAndSeries/deployPoolsProposal'
import { FYToken, PoolFactory, EmergencyBrake, Timelock } from '../../../../typechain'
import { developer, deployer, poolData, poolFees, timeStretch } from './addJuneSeries.mainnet.config'

/**
 * @dev This script grants the Timelock permission to create pools using the PoolFactory, and creates two pools
 */

;(async () => {
  const chainId = await getOriginalChainId()

  let ownerAcc = await getOwnerOrImpersonate(developer)

  const protocol = readAddressMappingIfExists('protocol.json');
  const governance = readAddressMappingIfExists('governance.json');

  const poolFactory = (await ethers.getContractAt(
    'PoolFactory',
    protocol.get('poolFactory') as string,
    ownerAcc
  )) as unknown as PoolFactory
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock
  const cloak = (await ethers.getContractAt(
    'EmergencyBrake',
    governance.get('cloak') as string,
    ownerAcc
  )) as unknown as EmergencyBrake

  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await updatePoolFeesProposal(poolFactory, poolFees))
  proposal = proposal.concat(await updateTimeStretchProposal(poolFactory, timeStretch))
  proposal = proposal.concat(await orchestratePoolFactoryProposal(deployer, poolFactory, timelock, cloak))
  proposal = proposal.concat(await deployPoolsProposal(ownerAcc, poolFactory, poolData))

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)

  // If the proposal has been executed, retrieve the pool addresses from the factory and print them out
  const hash = await timelock.hash(proposal)
  if ((await timelock.proposals(hash)).state === 0) {
    const pools: Map<string, string> = new Map()

    for (let [seriesId, fyTokenAddress] of poolData) {
      if ((await ethers.provider.getCode(fyTokenAddress)) === '0x') throw `FYToken at ${fyTokenAddress} contains no code`
      else console.log(`Using join at ${fyTokenAddress} for ${seriesId}`)
      const fyToken = await ethers.getContractAt('FYToken', fyTokenAddress, ownerAcc) as unknown as FYToken
      const baseAddress = await fyToken.underlying()

      const poolAddress = await poolFactory.calculatePoolAddress(baseAddress, fyTokenAddress)
      console.log(`Pool deployed at ${poolAddress}`)
      verify(poolAddress, [], 'safeERC20Namer.js')
      
      pools.set(seriesId, poolAddress)
    }

    writeAddressMap('newPools.json', pools) // newPools.json is a temporary file
  }
})()


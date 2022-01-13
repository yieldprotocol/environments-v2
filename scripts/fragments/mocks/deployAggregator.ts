import { waffle } from 'hardhat'
import { getOriginalChainId, getOwnerOrImpersonate, verify } from '../../../shared/helpers'

import ChainlinkAggregatorV3MockArtifact from '../../../artifacts/contracts/mocks/ChainlinkAggregatorV3Mock.sol/ChainlinkAggregatorV3Mock.json'

import { ISourceMock } from '../../../typechain/ISourceMock'

const { deployContract } = waffle


;(async () => {
    const chainId = await getOriginalChainId()
    
    const developer = new Map([
      [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
      [4, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
      [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
    ])
  
    let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string)

    const args: any = [18] // We only mock ETH sources (for now)
    const aggregator = (await deployContract(ownerAcc, ChainlinkAggregatorV3MockArtifact, args)) as ISourceMock
    await aggregator.deployed()
    console.log(`Mock Chainlink aggregator deployed at ${aggregator.address}`)
    verify(aggregator.address, args)
    // await aggregator.set('598100000000000000') // Set this to a relistic value for each aggregator
    return aggregator
})()

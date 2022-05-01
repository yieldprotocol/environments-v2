import { ethers, waffle } from 'hardhat'
import {
  getOriginalChainId,
  readAddressMappingIfExists,
  verify,
  writeAddressMap,
} from '../../../../../../../shared/helpers'

import ChainlinkAggregatorV3MockArtifact from '../../../../../../../artifacts/contracts/::mocks/ChainlinkAggregatorV3Mock.sol/ChainlinkAggregatorV3Mock.json'

import { ISourceMock } from '../../../../../../../typechain/ISourceMock'

const { deployContract } = waffle

;(async () => {
  const chainId = await getOriginalChainId()
  if (chainId === 1) throw "You shouldn't deploy Chainlink aggregator on mainnet"

  const [ownerAcc] = await ethers.getSigners()
  const protocol = readAddressMappingIfExists('protocol.json')
  let aggregator: ISourceMock
  if (protocol.get('usdtEthAggregator') === undefined) {
    const args: any = [18] // We only mock ETH sources (for now)
    aggregator = (await deployContract(ownerAcc, ChainlinkAggregatorV3MockArtifact, args)) as ISourceMock
    await aggregator.deployed()
    console.log(`Mock Chainlink aggregator deployed at ${aggregator.address}`)
    verify(aggregator.address, args)
    await aggregator.set('300234581912500') // Set this to a relistic value for each aggregator

    protocol.set('usdtEthAggregator', aggregator.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    aggregator = (await ethers.getContractAt(
      'ChainlinkAggregatorV3Mock',
      protocol.get('usdtEthAggregator') as string,
      ownerAcc
    )) as unknown as ISourceMock
    console.log(`Reusing Chainlink aggregator at ${aggregator.address}`)
  }
  return aggregator
})()

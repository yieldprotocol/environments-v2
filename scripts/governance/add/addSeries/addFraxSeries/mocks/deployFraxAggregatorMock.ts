import { ethers, waffle } from 'hardhat'
import { ETH, FRAX } from '../../../../../../shared/constants'
import { verify, getOriginalChainId, readAddressMappingIfExists, writeAddressMap } from '../../../../../../shared/helpers'

import ChainlinkAggregatorV3MockArtifact from '../../../../../../artifacts/contracts/::mocks/ChainlinkAggregatorV3Mock.sol/ChainlinkAggregatorV3Mock.json'
import { ChainlinkAggregatorV3Mock } from '../../../../../../typechain'

const { deployContract } = waffle

/**
 * @dev This script deploys the Frax Mock Chainlink Aggregator contract, if not deployed yet
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (chainId === 1) throw "You shouldn't deploy mock aggregator on mainnet"

  const [ownerAcc] = await ethers.getSigners()

  const baseId = FRAX
  const quoteId = ETH
  const protocol = readAddressMappingIfExists('protocol.json')
  if (protocol.get(`fraxOracleMock`) === undefined) {
    const args: any = [18]
    const aggregator = (await deployContract(
      ownerAcc,
      ChainlinkAggregatorV3MockArtifact,
      args
    )) as ChainlinkAggregatorV3Mock
    console.log(`[${baseId}/${quoteId}, '${aggregator.address}'],`)
    verify(aggregator.address, args)

    await aggregator.set('298097580000000')
    protocol.set('fraxOracleMock', aggregator.address)
    writeAddressMap('protocol.json', protocol)
  }
})()

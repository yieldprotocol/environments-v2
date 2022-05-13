import { ethers, waffle } from 'hardhat'
import * as hre from 'hardhat'
import * as fs from 'fs'
import { ETH, ENS } from '../../../../shared/constants'
import { mapToJson, jsonToMap, verify, getOriginalChainId } from '../../../../shared/helpers'

import ChainlinkAggregatorV3MockArtifact from '../../../../../artifacts/contracts/::mocks/ChainlinkAggregatorV3Mock.sol/ChainlinkAggregatorV3Mock.json'
import { ChainlinkAggregatorV3Mock } from '../../../../typechain'

const { deployContract } = waffle

/**
 * @dev This script deploys the ENS Mock Chainlink Aggregator contract, if not deployed yet
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (chainId !== 42) throw 'Only Kovan supported'

  const [ownerAcc] = await ethers.getSigners()

  const spotSources = jsonToMap(fs.readFileSync('./addresses/kovan/spotSources.json', 'utf8')) as Map<string, string>
  const baseId = ENS
  const quoteId = ETH

  if (spotSources.get(`${baseId}/${quoteId}`) === undefined) {
    const args: any = [18]
    const aggregator = (await deployContract(
      ownerAcc,
      ChainlinkAggregatorV3MockArtifact,
      args
    )) as ChainlinkAggregatorV3Mock
    console.log(`[${baseId}/${quoteId}, '${aggregator.address}'],`)
    verify(aggregator.address, args)
    await aggregator.set('14698870000000000')
    fs.writeFileSync('./addresses/kovan/spotSources.json', mapToJson(spotSources), 'utf8')
  }
})()

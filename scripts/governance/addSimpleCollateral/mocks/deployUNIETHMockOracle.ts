import { ethers, waffle } from 'hardhat'
import * as fs from 'fs'

import { mapToJson, jsonToMap, verify, getOriginalChainId } from '../../../../../shared/helpers'

import { ISourceMock } from '../../../../../typechain/ISourceMock'

import ChainlinkAggregatorV3MockArtifact from '../../../../../artifacts/contracts/mocks/ChainlinkAggregatorV3Mock.sol/ChainlinkAggregatorV3Mock.json'
import { ETH, UNI } from '../../../../../shared/constants'

const { deployContract } = waffle

/**
 * @dev This script deploys the ChainlinkAggregatorV3Mock contract, if not deployed yet
 */

;(async () => {
  let chainId: number
  chainId = await getOriginalChainId()
  const path = chainId == 1 ? './addresses/mainnet/' : './addresses/kovan/'
  if (chainId === 1) throw "You shouldn't deploy ChainlinkAggregatorV3Mock on mainnet"
  const [ownerAcc] = await ethers.getSigners()
  const spotSources = jsonToMap(fs.readFileSync(path + 'spotSources.json', 'utf8')) as Map<string, string>

  if (spotSources.get(UNI) === undefined) {
    const value = 4802398859596785
    const args: any = [18]
    const aggregator = (await deployContract(ownerAcc, ChainlinkAggregatorV3MockArtifact, args)) as ISourceMock
    verify(aggregator.address, args)
    await aggregator.set(value)
    spotSources.set(UNI+","+ETH, aggregator.address)
    fs.writeFileSync(path + 'spotSources.json', mapToJson(spotSources), 'utf8')
  }
})()

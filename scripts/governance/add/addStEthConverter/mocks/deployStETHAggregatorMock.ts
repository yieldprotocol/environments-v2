import { ethers, waffle } from 'hardhat'
import * as hre from 'hardhat'
import { ETH, STETH } from '../../../../../shared/constants'
import { verify } from '../../../../../shared/helpers'

import ChainlinkAggregatorV3MockArtifact from '../../../../../artifacts/contracts/::mocks/ChainlinkAggregatorV3Mock.sol/ChainlinkAggregatorV3Mock.json'
import { ChainlinkAggregatorV3Mock } from '../../../../../typechain'

const { deployContract } = waffle

/**
 * @dev This script deploys the WstETHMock contract, if not deployed yet
 */

;(async () => {
  if (hre.network.name === 'mainnet') throw "You shouldn't deploy WstETHMock on mainnet"
  const [ownerAcc] = await ethers.getSigners()

  const baseId = STETH
  const quoteId = ETH

  const args: any = [18]
  const aggregator = (await deployContract(
    ownerAcc,
    ChainlinkAggregatorV3MockArtifact,
    args
  )) as ChainlinkAggregatorV3Mock
  console.log(`[${baseId}/${quoteId}, '${aggregator.address}'],`)
  verify(aggregator.address, args)
  await aggregator.set('993446937361492000')
})()

import { ethers, waffle } from 'hardhat'

import { verify } from '../../../../shared/helpers'
import { ISourceMock } from '../../../../typechain/ISourceMock'
import ChainlinkAggregatorV3MockArtifact from '../../../../artifacts/contracts/::mocks/ChainlinkAggregatorV3Mock.sol/ChainlinkAggregatorV3Mock.json'

const { deployContract } = waffle

/**
 * @dev This script deploys the ChainlinkAggregatorV3Mock contract, if not deployed yet
 */

;(async () => {
  const [ownerAcc] = await ethers.getSigners()

  const value = 4802398859596785
  const args: any = [18]
  const aggregator = (await deployContract(ownerAcc, ChainlinkAggregatorV3MockArtifact, args)) as ISourceMock
  verify(aggregator.address, args)
  await aggregator.set(value)
})()

import { ethers, waffle } from 'hardhat'
import * as hre from 'hardhat'
import { ETH, STETH } from '../../../shared/constants'
import { verify, writeAddressMap } from '../../../shared/helpers'

import ChainlinkAggregatorV3MockArtifact from '../../../artifacts/contracts/::mocks/ChainlinkAggregatorV3Mock.sol/ChainlinkAggregatorV3Mock.json'
import { ChainlinkAggregatorV3Mock } from '../../../typechain'

const { deployContract } = waffle
const { chainLinkAnswers, protocol } = require(process.env.CONF as string)

/**
 * @dev This script deploys the WstETHMock contract, if not deployed yet
 */

;(async () => {
  if (hre.network.name === 'mainnet') throw "You shouldn't deploy WstETHMock on mainnet"
  const [ownerAcc] = await ethers.getSigners()
  for (const iterator of chainLinkAnswers) {
    const baseId = iterator[1]
    const quoteId = ETH

    const args: any = [iterator[0]]
    const aggregator = (await deployContract(
      ownerAcc,
      ChainlinkAggregatorV3MockArtifact,
      args
    )) as ChainlinkAggregatorV3Mock
    console.log(`[${baseId}/${quoteId}, '${aggregator.address}'],`)
    verify(aggregator.address, args)
    await aggregator.set(iterator[2])
    protocol.set(iterator[1] + 'Mock', aggregator.address)
  }
  writeAddressMap('protocol.json', protocol)
})()

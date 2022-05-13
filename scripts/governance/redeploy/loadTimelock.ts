import { ethers } from 'hardhat'
import { impersonate } from '../../../shared/helpers'
import { WAD } from '../../../shared/constants'
import { ERC20Mock } from '../../../typechain'
const { governance } = require(process.env.CONF as string)
const { assets, whales, poolsInit } = require(process.env.CONF as string)

const { formatUnits } = ethers.utils

/**
 * @dev This script loads the Timelock with assets to initialize strategies and pools. Only usable on forks.
 */

;(async () => {
  const [ownerAcc] = await ethers.getSigners()
  const on_fork = ownerAcc.address === '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'

  for (let [seriesId, baseId, baseAmount, fyTokenAmount] of poolsInit) {
    const whaleAcc = await impersonate(whales.get(baseId) as string, WAD)

    const asset = (await ethers.getContractAt(
      'contracts/::mocks/ERC20Mock.sol:ERC20Mock',
      assets.get(baseId) as string,
      whaleAcc
    )) as unknown as ERC20Mock
    const decimals = await asset.decimals()

    if (on_fork) {
      try {
        await asset.mint(governance.get('timelock') as string, baseAmount)
      } catch (error) {
        await asset.connect(whaleAcc).transfer(governance.get('timelock') as string, baseAmount)
      }
    } else await asset.connect(whaleAcc).transfer(governance.get('timelock') as string, baseAmount)

    console.log(`Loaded Timelock with ${formatUnits(baseAmount, decimals)} of ${await asset.symbol()}`)
  }
})()

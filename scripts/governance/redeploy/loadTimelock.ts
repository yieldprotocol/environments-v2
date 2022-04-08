import { ethers } from 'hardhat'
import { impersonate } from '../../../shared/helpers'
import { WAD } from '../../../shared/constants'
const { governance } = require(process.env.CONF as string)
const { assets, whales } = require(process.env.CONF as string)

const { formatUnits, parseUnits } = ethers.utils

/**
 * @dev This script loads the Timelock with assets to initialize strategies and pools. Only usable on forks.
 */

;(async () => {
  const [ownerAcc] = await ethers.getSigners()
  const on_fork = ownerAcc.address === '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'

  for (let [assetId, whaleAddress] of whales) {
    const whaleAcc = await impersonate(whaleAddress, WAD)

    const asset = await ethers.getContractAt(
      'contracts/::mocks/ERC20Mock.sol:ERC20Mock',
      assets.get(assetId) as string,
      whaleAcc
    )
    const decimals = await asset.decimals()
    const initAmount = parseUnits('1000', decimals)

    if (on_fork) await asset.mint(governance.get('timelock') as string, initAmount)
    else await asset.connect(whaleAcc).transfer(governance.get('timelock') as string, initAmount)

    console.log(`Loaded Timelock with ${formatUnits(initAmount, decimals)} of ${await asset.symbol()}`)
  }
})()

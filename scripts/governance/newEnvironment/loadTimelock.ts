import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'
import { readAddressMappingIfExists, impersonate } from '../../../shared/helpers'
import { WAD } from '../../../shared/constants'
import { ERC20Mock } from '../../../typechain'
import { assets, whales } from './newEnvironment.rinkeby.config'

/**
 * @dev This script loads the Timelock with assets to initialize strategies and pools. Only usable on forks.
 */

;(async () => {
  const governance = readAddressMappingIfExists('governance.json');

  for (let [assetId, whaleAddress] of whales) {
    const whaleAcc = await impersonate(whaleAddress, WAD)

    const asset = (await ethers.getContractAt('ERC20Mock', assets.get(assetId) as string, whaleAcc)) as unknown as ERC20Mock
    const initAmount = BigNumber.from(1000).mul(BigNumber.from(10).pow(await asset.decimals()))
    await asset.connect(whaleAcc).transfer(governance.get('timelock') as string, initAmount)
    console.log(`Loaded Timelock with ${initAmount} of ${await asset.symbol()}`)
  }
})()
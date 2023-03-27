import { ethers } from 'hardhat'
import { TIMELOCK, CAULDRON, ETH, DAI, USDC, USDT, FRAX } from '../shared/constants';
import { getName } from '../shared/helpers'
import { ERC20__factory, Cauldron__factory } from '../typechain';
const { governance, protocol } = require(process.env.CONF as string)

;(async () => {
  for (let assetId of [ETH, DAI, USDC, USDT, FRAX]) {

    const timelockAddress = governance.getOrThrow(TIMELOCK)!
    const cauldron = Cauldron__factory.connect(protocol.getOrThrow(CAULDRON)!, ethers.provider)
    const asset = ERC20__factory.connect(await cauldron.assets(assetId), ethers.provider)

    console.log(`${getName(assetId)}: ${await asset.balanceOf(timelockAddress)}`)
  }
})()

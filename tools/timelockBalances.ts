import { ethers } from 'hardhat'
import { TIMELOCK } from '../shared/constants';
import { getName } from '../shared/helpers'
import { ERC20__factory } from '../typechain';
const { governance, eth, dai, usdc, usdt } = require(process.env.CONF as string)

;(async () => {

    for (let asset of [eth, dai, usdc, usdt]) {

      const timelockAddress = governance.getOrThrow(TIMELOCK)!

      console.log(`${getName(asset.assetId)}: ${await (ERC20__factory.connect(asset.address, ethers.provider)).balanceOf(timelockAddress)}`)
    }
  })()
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

  const addresses = [
    [
      "0x1030FF000000",
      "0x24F5043810f7641773eFFa1B6038A93C9d36E603"
    ],
    [
      "0x1031FF000000",
      "0xa316B9c8de61af945450407b849bbd60DD16Dc90"
    ],
    [
      "0x1032FF000000",
      "0x3D1CC35b9A5C579BEd234fa3aA683c6922ebcC89"
    ],
    [
      "0x10A0FF000000",
      "0xDDF9F056cb829Ec347054F7544c7252dd3bEf23E"
    ]
  ]

    for (let [id, address] of addresses) {

      const timelockAddress = governance.getOrThrow(TIMELOCK)!
      const asset = ERC20__factory.connect(address, ethers.provider)

      console.log(`${getName(id)}: ${await asset.balanceOf(timelockAddress)}`)
    }
  })()
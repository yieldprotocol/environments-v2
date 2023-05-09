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
      "0x5659f298A39E85cC9b384Afc0fd8FFB5e1CC3f0e"
    ],
    [
      "0x1031FF000000",
      "0xF441c801331be910f9a60BCa778eB3a36D6858F3"
    ],
    [
      "0x1032FF000000",
      "0xfD4cd937752fcaF8Bac3A594c44A2abC069b617B"
    ],
    [
      "0x10A0FF000000",
      "0xD93A4d4B7051ff7A02C200DCC1b2168b0D31a34E"
    ]
  ]

    for (let [id, address] of addresses) {

      const timelockAddress = governance.getOrThrow(TIMELOCK)!
      const asset = ERC20__factory.connect(address, ethers.provider)

      console.log(`${getName(id)}: ${await asset.balanceOf(timelockAddress)}`)
    }
  })()
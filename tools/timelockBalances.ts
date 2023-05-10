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
      "0xA8e46Bb19d583d473ed064ebF20715D01057f711"
    ],
    [
      "0x1031FF000000",
      "0xD5657d3E53B5e3C950346F6Ec8bc37ECb3753A77"
    ],
    [
      "0x1032FF000000",
      "0x09258a8705469d85E875398463d1d3C9a37F72e3"
    ],
    [
      "0x10A0FF000000",
      "0x17d2a2B20954A4Cab2A62245f366788B5aD41323"
    ],
    [
      "0x1030FF000001",
      "0x11DE3906878D4d662a9806B823945b1Ed0d06DF3"
    ],
    [
      "0x1031FF000001",
      "0xf4F55FEe864746dD55501D4897a1ae774717948A"
    ],
    [
      "0x1032FF000001",
      "0x29ac0e98E355a073A863baBc9E3D353DF1156c22"
    ],
    [
      "0x10A0FF000001",
      "0xdC42495E55A197B66Cd18E6309e05e3187791FD6"
    ]
  ]

    for (let [id, address] of addresses) {

      const timelockAddress = governance.getOrThrow(TIMELOCK)!
      const asset = ERC20__factory.connect(address, ethers.provider)

      console.log(`${getName(id)}: ${await asset.balanceOf(timelockAddress)}`)
    }
  })()
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
      "0x1030FF000FFF",
      "0xcf30A5A994f9aCe5832e30C138C9697cda5E1247"
    ],
    [
      "0x1031FF000FFF",
      "0x7ACFe277dEd15CabA6a8Da2972b1eb93fe1e2cCD"
    ],
    [
      "0x1032FF000FFF",
      "0xFBc322415CBC532b54749E31979a803009516b5D"
    ],
    [
      "0x10A0FF000FFF",
      "0xF708005ceE17b2c5Fe1a01591E32ad6183A12EaE"
    ],
    [
      "0x1030FF000FFE",
      "0xb268E2C85861B74ec75fe728Ae40D9A2308AD9Bb"
    ],
    [
      "0x1031FF000FFE",
      "0x9ca2a34ea52bc1264D399aCa042c0e83091FEECe"
    ],
    [
      "0x1032FF000FFE",
      "0x5dd6DcAE25dFfa0D46A04C9d99b4875044289fB2"
    ],
    [
      "0x10A0FF000FFE",
      "0x428e229aC5BC52a2e07c379B2F486fefeFd674b1"
    ],
    [
      "YSFRAX6MMS",
      "0x1565F539E96c4d440c38979dbc86Fd711C995DD6"
    ],
    [
      "0x1138FF000000",
      "0x4B010fA49E8b673D0682CDeFCF7834328076748C"
    ],
    [
      "0x1030FF000000",
      "0x0041e283eF4ad1287521d0e5b4Cdfa1ef17Ecb30"
    ],
    [
      "0x1031FF000000",
      "0x895542fCba49d36BE75FCA73F20Af73c0d96c3F9"
    ],
    [
      "0x1032FF000000",
      "0x27486d23F53b62517720228eC87fF65F1e3c83ad"
    ],
    [
      "0x10A0FF000000",
      "0x6696FCF6A8269F5f3eE909Fb4Dd11E7b9548f155"
    ]
  ]

    for (let [id, address] of addresses) {

      const timelockAddress = governance.getOrThrow(TIMELOCK)!
      const asset = ERC20__factory.connect(address, ethers.provider)

      console.log(`${getName(id)}: ${await asset.balanceOf(timelockAddress)}`)
    }
  })()
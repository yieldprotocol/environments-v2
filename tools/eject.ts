
import { MULTISIG } from '../shared/constants';
import { impersonate, getName } from '../shared/helpers';
import { Strategy__factory } from '../typechain';

const { governance } = require(process.env.CONF as string)

const strategyAddresses = [
  [
    "0x1030FF000000",
    "0xFcFc74fA508450C8Ff681E6894Ab2C9852bD32a7"
  ],
  [
    "0x1031FF000000",
    "0x742b05A7AF59C31576E4f31B092Caff580B162C3"
  ],
  [
    "0x1032FF000000",
    "0x3e63834310D771d6157706c37778FB1B53eAf6F2"
  ],
  [
    "0x10A0FF000000",
    "0x45eB9E5c68A078BfC92F3d46592E0E35a732F7aC"
  ],
  [
    "0x1030FF000001",
    "0x51D2fCCcC9003f0743bfAa4E495cda5BBA749283"
  ],
  [
    "0x1031FF000001",
    "0x2008E463c4d0364763569dFE16cdF4E6F29bCe8E"
  ],
  [
    "0x1032FF000001",
    "0x85fA3071AD36d12603176C12118d25602D2229aB"
  ],
  [
    "0x10A0FF000001",
    "0xB3E47e689D21d75303E28884187a5681cEfaf40B"
  ]
]

;(async () => {
  const multisig = await impersonate(governance.getOrThrow(MULTISIG)!)
  
  for (let [strategyId, strategyAddress] of strategyAddresses) {
    const strategy = Strategy__factory.connect(strategyAddress, multisig)
    console.log(`Ejecting: ${getName(strategyId)}`);

    (await strategy.eject()).wait(1);
    console.log(`Ejected`);
  }
})()

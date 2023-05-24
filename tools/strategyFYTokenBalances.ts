import { ethers } from 'hardhat'
import { getName } from '../shared/helpers'
import { Strategy__factory } from '../typechain';
import { YSETH6MJD, YSETH6MMS, YSUSDC6MJD, YSUSDC6MMS, YSDAI6MJD, YSDAI6MMS, YSUSDT6MJD, YSUSDT6MMS } from '../shared/constants';

const strategies: Map<string, string> = new Map([
  [YSETH6MJD,"0xad1983745D6c739537fEaB5bed45795f47A940b3"],
  [YSETH6MMS,"0x5582b8398FB586F1b79edd1a6e83f1c5aa558955"],
  [YSDAI6MJD,"0x4276BEaA49DE905eED06FCDc0aD438a19D3861DD"],
  [YSDAI6MMS,"0x5aeB4EFaAA0d27bd606D618BD74Fe883062eAfd0"],
  [YSUSDC6MJD,"0x33e6B154efC7021dD55464c4e11a6AfE1f3D0635"],
  [YSUSDC6MMS,"0x3b4FFD93CE5fCf97e61AA8275Ec241C76cC01a47"],
  [YSUSDT6MJD,"0x861509a3fa7d87faa0154aae2cb6c1f92639339a"],
  [YSUSDT6MMS,"0xfe2aba5ba890af0ee8b6f2d488b1f85c9e7c5643"],
])

;(async () => {
  for (let [strategyId, strategyAddress] of strategies) {
    const strategy = Strategy__factory.connect(strategyAddress, ethers.provider)
    console.log(`${getName(strategyId)}(${await strategy.state()}): ${await strategy.fyTokenCached()}`)
  }
})()

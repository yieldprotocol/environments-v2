import { ethers } from 'hardhat'
import {
  ETH,
  DAI,
  USDC,
  WBTC,
  WSTETH,
  LINK,
  ENS,
  YVUSDC,
  UNI,
  FRAX,
  FDAI2303,
  FDAI2306,
  FETH2303,
  FETH2306,
  FUSDC2303,
  FUSDC2306,
} from '../../../../shared/constants'
import { Cauldron } from '../../../../typechain'

const { protocol } = require(process.env.CONF as string)

/**
 * @dev This script displays all debt limits
 */

;(async () => {
  let [ownerAcc] = await ethers.getSigners()

  console.log(protocol.get('cauldron') as string)

  // Contract instantiation
  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron

  // const bases = [ETH, DAI, USDC, FRAX]
  // const ilks = [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, YVUSDC, UNI, FRAX, FETH2303, FETH2306,  FDAI2303, FDAI2306, FUSDC2303, FUSDC2306,  ]
  const bases = [ETH, DAI, USDC]
  const ilks = [FETH2303, FETH2306, FDAI2303, FDAI2306, FUSDC2303, FUSDC2306]

  for (let baseId of bases) {
    for (let ilkId of ilks) {
      const debt = await cauldron.debt(baseId, ilkId)
      if (debt.max.gt('0')) {
        console.log(`${baseId}, ${ilkId}, ${debt.max}, ${debt.min}, ${debt.dec}`)
      }
    }
  }
})()

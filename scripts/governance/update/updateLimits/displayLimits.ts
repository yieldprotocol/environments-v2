import { ethers } from 'hardhat'
import { getOwnerOrImpersonate } from '../../../../shared/helpers'
import { ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, YVUSDC, UNI, FRAX } from '../../../../shared/constants'
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

  const bases = [ETH, DAI, USDC, FRAX]
  const ilks = [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, YVUSDC, UNI, FRAX]

  for (let baseId of bases) {
    for (let ilkId of ilks) {
      const debt = await cauldron.debt(baseId, ilkId)
      console.log(`${baseId}, ${ilkId}, ${debt.max}, ${debt.min}, ${debt.dec}`)
    }
  }
})()

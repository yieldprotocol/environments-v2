import { YieldNotionalLever__factory, IERC20__factory } from '../../../../typechain'
import { getOwnerOrImpersonate } from '../../../../shared/helpers'
import { YIELD_NOTIONAL_LEVER, WAD } from '../../../../shared/constants'

const { developer } = require(process.env.CONF as string)
const { protocol } = require(process.env.CONF as string)

/**
 * @dev This script orchestrates the yieldNotionalLever and sets flashfeefactor on joins and fyTokens
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)
  const yieldNotionalLever = YieldNotionalLever__factory.connect(protocol().getOrThrow(YIELD_NOTIONAL_LEVER), ownerAcc)
  let daiWhale = await getOwnerOrImpersonate('0x075e72a5edf65f0a5f44699c7654c1a76941ddc8', WAD)
  let usdcWhale = await getOwnerOrImpersonate('0x0a59649758aa4d66e25f08dd01271e891fe52199', WAD)

  const usdc = IERC20__factory.connect('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', ownerAcc)
  const dai = IERC20__factory.connect('0x6B175474E89094C44Da98b954EedeAC495271d0F', ownerAcc)
  await usdc.connect(usdcWhale).approve(yieldNotionalLever.address, WAD.mul(10))
  await dai.connect(daiWhale).approve(yieldNotionalLever.address, WAD.mul(10))

  await yieldNotionalLever.connect(usdcWhale).invest('0x303230380000', '0x323400000000', 2000e6, 5000e6)
  await yieldNotionalLever.connect(daiWhale).invest('0x303230380000', '0x323400000000', 2000e18, 5000e18)
})()

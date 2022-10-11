import { getOwnerOrImpersonate, readAddressMappingIfExists } from '../../../../../shared/helpers'

import { ETH, WAD } from '../../../../../shared/constants'
import { IWETH9__factory } from '../../../../../typechain'

const { developer, assets } = require(process.env.CONF as string)

/**
 * @dev This script loads the Timelock with Ether to initialize pools and strategies
 */
;(async () => {
  // const chainId = await getOriginalChainId()

  let ownerAcc = await getOwnerOrImpersonate(developer)

  const governance = readAddressMappingIfExists('governance.json')

  const weth = IWETH9__factory.connect(assets.get(ETH) as string, ownerAcc)

  await weth.deposit({ value: WAD.div(50).mul(4) })
  await weth.transfer(governance.get('timelock') as string, WAD.div(50).mul(4))
})()

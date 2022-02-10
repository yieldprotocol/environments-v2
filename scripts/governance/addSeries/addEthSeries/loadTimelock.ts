import { ethers } from 'hardhat'
import { readAddressMappingIfExists, getOwnerOrImpersonate, getOriginalChainId } from '../../../../shared/helpers'

import { WETH9Mock } from '../../../../typechain'
import { ETH, WAD } from '../../../../shared/constants'
const { developer, assets } = require(process.env.CONF as string)

/**
 * @dev This script loads the Timelock with Ether to initialize pools and strategies
 */
;(async () => {
  const chainId = await getOriginalChainId()

  let ownerAcc = await getOwnerOrImpersonate(developer)

  const governance = readAddressMappingIfExists('governance.json')

  const weth = (await ethers.getContractAt(
    'WETH9Mock',
    assets.get(ETH) as string,
    ownerAcc
  )) as unknown as WETH9Mock

  await weth.deposit({ value: WAD.div(50).mul(4) })
  await weth.transfer(governance.get('timelock') as string, WAD.div(50).mul(4))
})()

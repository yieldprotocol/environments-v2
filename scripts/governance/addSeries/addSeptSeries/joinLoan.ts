import { ethers } from 'hardhat'
import { readAddressMappingIfExists, impersonate, getOriginalChainId } from '../../../../shared/helpers'
import { WAD, FYDAI2203, FYUSDC2203, USDC } from '../../../../shared/constants'
import { ERC20Mock, Ladle, Join } from '../../../../typechain'
const { whales, joinLoans, governance, protocol } = require(process.env.CONF as string)
/**
 * @dev This script loads the Timelock with assets to initialize pools and strategies. Only usable on forks.
 */
;(async () => {
  const protocol = readAddressMappingIfExists('protocol.json')

  let ladleAcc = await impersonate(protocol.get('ladle') as string, WAD)
  const ladle = (await ethers.getContractAt('Ladle', ladleAcc.address, ladleAcc)) as Ladle

  for (let [assetId, loanAmount] of joinLoans) {
    const whaleAcc = await impersonate(whales.get(assetId) as string, WAD)

    const join = (await ethers.getContractAt('Join', await ladle.joins(assetId), ladleAcc)) as Join
    const asset = (await ethers.getContractAt(
      'contracts/::mocks/ERC20Mock.sol:ERC20Mock',
      await join.asset(),
      whaleAcc
    )) as ERC20Mock

    await asset.transfer(join.address, loanAmount)
    await join.join(join.address, loanAmount)
    console.log(`Loaned ${loanAmount} of ${assetId} to the join at ${join.address}`)
  }
})()

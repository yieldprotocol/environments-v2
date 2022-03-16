import { ethers } from 'hardhat'
import { readAddressMappingIfExists, impersonate, getOriginalChainId } from '../../../../shared/helpers'

import { Strategy, Pool, FYToken, Join, ERC20Mock } from '../../../../typechain'
const { developer, rollData } = require(process.env.CONF as string)
import { WAD, MAX256, EOMAR22 } from '../../../../shared/constants'

/**
 * @dev This script deploys two strategies to be used for Ether
 */
;(async () => {
  let ownerAcc = await impersonate(developer)
  const blockNumBefore = await ethers.provider.getBlockNumber()
  const blockBefore = await ethers.provider.getBlock(blockNumBefore)
  const timestampBefore = blockBefore.timestamp
  if (timestampBefore < EOMAR22) await ethers.provider.send('evm_mine', [EOMAR22+1])

  const protocol = readAddressMappingIfExists('protocol.json')
  const strategies = readAddressMappingIfExists('strategies.json')
  for (let index = 0; index < rollData.length; index++) {
    let strategyAcc = await impersonate(strategies.get(rollData[index][0]) as string, WAD)
    let ladleAcc = await impersonate(protocol.get('ladle') as string, WAD)

    const strategy = (await ethers.getContractAt('Strategy', strategyAcc.address, ownerAcc)) as unknown as Strategy

    const pool = (await ethers.getContractAt('Pool', await strategy.pool(), strategyAcc)) as unknown as Pool

    const base = (await ethers.getContractAt(
      'contracts/::mocks/ERC20Mock.sol:ERC20Mock',
      await pool.base(),
      strategyAcc
    )) as unknown as ERC20Mock

    const fyToken = (await ethers.getContractAt('FYToken', await pool.fyToken(), strategyAcc)) as unknown as FYToken
    let fyTokenAcc = await impersonate(fyToken.address, WAD)

    const join = (await ethers.getContractAt('Join', await fyToken.join(), strategyAcc)) as unknown as Join

    const toDivest = await pool.balanceOf(strategy.address)
    console.log(`toDivest: ${toDivest}`)
    await pool.transfer(pool.address, toDivest)
    await pool.burn(strategy.address, strategy.address, 0, MAX256)
    console.log(`base in strategy: ${await base.balanceOf(strategy.address)}`)

    await fyToken.accrual()
    console.log(`Chi at maturity is ${await fyToken.chiAtMaturity()}`)
    console.log(`Accrual is ${await fyToken.callStatic.accrual()}`)

    // Simulate the redemption
    const fyTokenDivested = await fyToken.balanceOf(strategy.address)
    await fyToken.transfer(fyToken.address, fyTokenDivested)
    console.log(`fyToken transferred to the fyToken contract: ${fyTokenDivested}`)
    await fyToken.connect(ladleAcc).burn(strategyAcc.address, fyTokenDivested)
    console.log(`fyToken balance after burn: ${await fyToken.balanceOf(fyToken.address)}`)

    console.log(`join stored balance: ${await join.storedBalance()}`)
    console.log(`join real balance:   ${await base.balanceOf(join.address)}`)
    console.log(`amount removed:      ${fyTokenDivested}`)
    await join.connect(fyTokenAcc).exit(strategy.address, fyTokenDivested)
    console.log(`base in strategy after redemption: ${await base.balanceOf(strategy.address)}`)
    // await fyToken.redeem(strategy.address, fyTokenDivested)
  }
})()

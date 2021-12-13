import { ethers, network } from 'hardhat'
import { BigNumber } from 'ethers'
import {
  stringToBytes6,
  bytesToBytes32,
  impersonate,
  getOriginalChainId,
  readAddressMappingIfExists,
} from '../../../../shared/helpers'
import {
  ERC20Mock,
  Cauldron,
  Ladle,
  FYToken,
  CompositeMultiOracle,
  Join,
} from '../../../../typechain'

import { CVX3CRV, WAD } from '../../../../shared/constants'

/**
 * @dev This script tests YVUSDC as a collateral
 */
import { LadleWrapper } from '../../../../shared/ladleWrapper'
import { ConvexStakingWrapperYield } from '../../../../typechain/ConvexStakingWrapperYield'
import { ConvexLadleModule } from '../../../../typechain/ConvexLadleModule'
;(async () => {
  const chainId = await getOriginalChainId()
  if (!(chainId === 1 || chainId === 4 || chainId === 42)) throw 'Only Kovan, Rinkeby and Mainnet supported'

  const seriesIds: Array<string> = [
    stringToBytes6('0104'),
    stringToBytes6('0105'),
    stringToBytes6('0204'),
    stringToBytes6('0205'),
  ]

  // Impersonate cvx3Crv whale 0xd7a029db2585553978190db5e85ec724aa4df23f
  const cvx3CrvWhale = '0xf5b9a5159cb45efcba4f499b7b19667eaa649134'
  const cvx3CrvWhaleAcc = await impersonate(cvx3CrvWhale, WAD)

  const cvx3CrvAddress = new Map([[1, '0x30d9410ed1d5da1f6c8391af5338c93ab8d4035c']]) // https://cvx3Crv.mirror.xyz/5cGl-Y37aTxtokdWk21qlULmE1aSM_NuX9fstbOPoWU

  const protocol = readAddressMappingIfExists('protocol.json')

  const cvx3Crv = (await ethers.getContractAt(
    'ERC20Mock',
    cvx3CrvAddress.get(chainId) as string,
    cvx3CrvWhaleAcc
  )) as unknown as ERC20Mock
  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    cvx3CrvWhaleAcc
  )) as unknown as Cauldron
  const innerLadle = (await ethers.getContractAt(
    'Ladle',
    protocol.get('ladle') as string,
    cvx3CrvWhaleAcc
  )) as unknown as Ladle

  let ladle: LadleWrapper
  ladle = new LadleWrapper(innerLadle)

  const oracle = (await ethers.getContractAt(
    'CompositeMultiOracle',
    protocol.get('compositeOracle') as string,
    cvx3CrvWhaleAcc
  )) as unknown as CompositeMultiOracle

  const convexStakingWrapperYield = (await ethers.getContractAt(
    'ConvexStakingWrapperYield',
    protocol.get('convexStakingWrapperYield') as string,
    cvx3CrvWhaleAcc
  )) as unknown as ConvexStakingWrapperYield

  const convexLadleModule = (await ethers.getContractAt(
    'ConvexLadleModule',
    protocol.get('convexLadleModule') as string,
    cvx3CrvWhaleAcc
  )) as unknown as ConvexLadleModule

  const crv = (await ethers.getContractAt(
    'ERC20Mock',
    '0xd533a949740bb3306d119cc777fa900ba034cd52',
    cvx3CrvWhaleAcc
  )) as unknown as ERC20Mock

  const cvx = (await ethers.getContractAt(
    'ERC20Mock',
    '0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b',
    cvx3CrvWhaleAcc
  )) as unknown as ERC20Mock

  const cvx3CrvBalanceBefore = await cvx3Crv.balanceOf(cvx3CrvWhaleAcc.address)
  console.log(`${cvx3CrvBalanceBefore} cvx3Crv available`)
  const join = (await ethers.getContractAt('Join', await ladle.joins(CVX3CRV), cvx3CrvWhaleAcc)) as Join

  // Batch action to build a vault & add it to the wrapper
  const addVaultCall = convexLadleModule.interface.encodeFunctionData('addVault', [
    convexStakingWrapperYield.address,
    '0x000000000000000000000000',
  ])

  for (let seriesId of seriesIds) {
    console.log(`series: ${seriesId}`)
    const series = await cauldron.series(seriesId)
    const fyToken = (await ethers.getContractAt('FYToken', series.fyToken, cvx3CrvWhaleAcc)) as unknown as FYToken

    const dust = (await cauldron.debt(series.baseId, CVX3CRV)).min
    const ratio = (await cauldron.spotOracles(series.baseId, CVX3CRV)).ratio
    const borrowed = BigNumber.from(10)
      .pow(await fyToken.decimals())
      .mul(dust)
    const posted = (await oracle.peek(bytesToBytes32(series.baseId), bytesToBytes32(CVX3CRV), borrowed))[0]
      .mul(ratio)
      .div(1000000)
      .mul(101)
      .div(100) // borrowed * spot * ratio * 1.01 (for margin)
    console.log(`${posted} cvx3Crv posted`)
    // Build vault
    await ladle.batch([
      ladle.buildAction(seriesId, CVX3CRV),
      ladle.moduleCallAction(convexLadleModule.address, addVaultCall),
    ])
    const logs = await cauldron.queryFilter(cauldron.filters.VaultBuilt(null, null, null, null))
    const vaultId = logs[logs.length - 1].args.vaultId
    console.log(`vault: ${vaultId}`)
    const cvx3CrvBefore = (await cvx3Crv.balanceOf(cvx3CrvWhaleAcc.address)).toString()
    // Post CVX3CRV and borrow fyDAI
    await cvx3Crv.approve(convexStakingWrapperYield.address, posted)
    const wrapCall = convexStakingWrapperYield.interface.encodeFunctionData('stakeFor', [
      posted,
      cvx3CrvWhaleAcc.address,
      join.address,
    ])
    await ladle.batch([
      ladle.routeAction(convexStakingWrapperYield.address, wrapCall),
      ladle.pourAction(vaultId, cvx3CrvWhaleAcc.address, posted, borrowed),
    ])
    console.log(`posted and borrowed`)

    if ((await cauldron.balances(vaultId)).art.toString() !== borrowed.toString()) throw 'art mismatch'
    if ((await cauldron.balances(vaultId)).ink.toString() !== posted.toString()) throw 'ink mismatch'

    const crvBefore = await crv.balanceOf(cvx3CrvWhaleAcc.address)
    const cvxBefore = await cvx.balanceOf(cvx3CrvWhaleAcc.address)
    
    // Claim CVX & CRV reward
    await convexStakingWrapperYield.getReward(cvx3CrvWhaleAcc.address)
    const crvAfter = (await crv.balanceOf(cvx3CrvWhaleAcc.address)).toString()
    const cvxAfter = (await cvx.balanceOf(cvx3CrvWhaleAcc.address)).toString()
    if(crvBefore.gt(crvAfter)) throw "Reward claim failed"
    if(cvxBefore.gt(cvxAfter)) throw "Reward claim failed"
    console.log("reward claimed")
    // Repay fyDai and withdraw cvx3Crv
    await fyToken.transfer(fyToken.address, borrowed)

    const unwrapCall = convexStakingWrapperYield.interface.encodeFunctionData('withdrawFor', [
      posted,
      cvx3CrvWhaleAcc.address,
    ])
    await ladle.batch([
      ladle.pourAction(vaultId, cvx3CrvWhaleAcc.address, posted.mul(-1), borrowed.mul(-1)),
      ladle.routeAction(convexStakingWrapperYield.address, unwrapCall),
    ])

    console.log(`repaid and withdrawn`)
    const cvx3CrvAfter = (await cvx3Crv.balanceOf(cvx3CrvWhaleAcc.address)).toString()
    console.log(`${cvx3CrvAfter} cvx3Crv after`)
    if(cvx3CrvAfter !== cvx3CrvBefore) throw "cvx3Crv balance mismatch"
  }
})()

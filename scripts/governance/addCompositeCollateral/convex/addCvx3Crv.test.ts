import { ethers, network } from 'hardhat'
import { BigNumber } from 'ethers'
import {
  stringToBytes6,
  bytesToBytes32,
  impersonate,
  getOriginalChainId,
  readAddressMappingIfExists,
} from '../../../../shared/helpers'
import { ERC20Mock, Cauldron, Ladle, FYToken, CompositeMultiOracle, Join } from '../../../../typechain'

import { CVX3CRV, UNI, WAD } from '../../../../shared/constants'

/**
 * @dev This script tests cvx3Crv as a collateral
 */
import { LadleWrapper } from '../../../../shared/ladleWrapper'
import { ConvexStakingWrapperYield } from '../../../../typechain/ConvexStakingWrapperYield'
import { ConvexModule } from '../../../../typechain/ConvexModule'
;(async () => {
  const chainId = await getOriginalChainId()
  if (!(chainId === 1 || chainId === 4 || chainId === 42)) throw 'Only Kovan, Rinkeby and Mainnet supported'

  const seriesIds: Array<string> = [
    stringToBytes6('0104'),
    stringToBytes6('0105'),
    stringToBytes6('0204'),
    stringToBytes6('0205'),
  ]
  const protocol = readAddressMappingIfExists('protocol.json')

  // Impersonate cvx3Crv whale 0xd7a029db2585553978190db5e85ec724aa4df23f
  const cvx3CrvWhale = '0xf5b9a5159cb45efcba4f499b7b19667eaa649134'
  const cvx3CrvWhaleAcc = await impersonate(cvx3CrvWhale, WAD)

  const cvx3CrvAddress = new Map([
    [1, '0x30d9410ed1d5da1f6c8391af5338c93ab8d4035c'],
    [42, protocol.get('cvx3CrvMock') as string],
  ]) // https://cvx3Crv.mirror.xyz/5cGl-Y37aTxtokdWk21qlULmE1aSM_NuX9fstbOPoWU
  const crvAddress = new Map([
    [1, '0xd533a949740bb3306d119cc777fa900ba034cd52'],
    [42, protocol.get('crvMock') as string],
  ])
  const cvxAddress = new Map([
    [1, '0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b'],
    [42, protocol.get('crvMock') as string],
  ])
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
    'ConvexModule',
    protocol.get('convexLadleModule') as string,
    cvx3CrvWhaleAcc
  )) as unknown as ConvexModule

  const crv = (await ethers.getContractAt(
    'ERC20Mock',
    crvAddress.get(chainId) as string,
    cvx3CrvWhaleAcc
  )) as unknown as ERC20Mock

  const cvx = (await ethers.getContractAt(
    'ERC20Mock',
    cvxAddress.get(chainId) as string,
    cvx3CrvWhaleAcc
  )) as unknown as ERC20Mock

  if (chainId === 42) {
    await cvx3Crv.mint(cvx3CrvWhale, ethers.utils.parseEther('100000'))
    await crv.mint(protocol.get('convexPoolMock') as string, ethers.utils.parseEther('100000'))
  }

  const cvx3CrvBalanceBefore = await cvx3Crv.balanceOf(cvx3CrvWhaleAcc.address)
  console.log(`${cvx3CrvBalanceBefore} cvx3Crv available`)

  const join = (await ethers.getContractAt('Join', await ladle.joins(CVX3CRV), cvx3CrvWhaleAcc)) as Join

  // Batch action to build a vault & add it to the wrapper
  const addVaultCall = convexLadleModule.interface.encodeFunctionData('addVault', [
    convexStakingWrapperYield.address,
    '0x000000000000000000000000',
  ])
  console.log('Contract balance ' + (await crv.balanceOf(convexStakingWrapperYield.address)).toString())
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
    await cvx3Crv.approve(ladle.address, posted)

    const wrapCall = convexStakingWrapperYield.interface.encodeFunctionData('wrap', [join.address])

    await ladle.batch([
      ladle.transferAction(cvx3Crv.address, convexStakingWrapperYield.address, posted),
      ladle.routeAction(convexStakingWrapperYield.address, wrapCall),
      ladle.pourAction(vaultId, cvx3CrvWhaleAcc.address, posted, borrowed),
    ])

    if ((await cauldron.balances(vaultId)).art.toString() !== borrowed.toString()) throw 'art mismatch'
    if ((await cauldron.balances(vaultId)).ink.toString() !== posted.toString()) throw 'ink mismatch'

    const crvBefore = await crv.balanceOf(cvx3CrvWhaleAcc.address)
    const cvxBefore = await cvx.balanceOf(cvx3CrvWhaleAcc.address)

    // Claim CVX & CRV reward
    await convexStakingWrapperYield.getReward(cvx3CrvWhaleAcc.address)
    var crvAfter = await crv.balanceOf(cvx3CrvWhaleAcc.address)
    var cvxAfter = await cvx.balanceOf(cvx3CrvWhaleAcc.address)
    if (crvBefore.gt(crvAfter)) throw 'Reward claim failed'
    if (cvxBefore.gt(cvxAfter)) throw 'Reward claim failed'
    console.log('Reward Claimed')

    // Repay fyDai and withdraw cvx3Crv
    await fyToken.transfer(fyToken.address, borrowed)

    const unwrapCall = convexStakingWrapperYield.interface.encodeFunctionData('unwrap', [cvx3CrvWhale])

    await ladle.batch([
      ladle.pourAction(vaultId, convexStakingWrapperYield.address, posted.mul(-1), borrowed.mul(-1)),
      ladle.routeAction(convexStakingWrapperYield.address, unwrapCall),
    ])

    console.log(`repaid and withdrawn`)
    const cvx3CrvAfter = (await cvx3Crv.balanceOf(cvx3CrvWhaleAcc.address)).toString()
    console.log(`${cvx3CrvAfter} cvx3Crv after`)
    if (cvx3CrvAfter !== cvx3CrvBefore) throw 'cvx3Crv balance mismatch'
  }
})()
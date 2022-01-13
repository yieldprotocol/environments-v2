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

import { CVX3CRV, WAD } from '../../../../shared/constants'
import { cvx3CrvAddress, crvAddress, cvxAddress } from './addCvx3Crv.config'
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

  const user2 = await impersonate('0xd7a029db2585553978190db5e85ec724aa4df23f', WAD)

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

  // If Kovan then provide necessary tokens to the whale & pool
  if (chainId === 42) {
    await cvx3Crv.mint(cvx3CrvWhale, ethers.utils.parseEther('100000'))
    await crv.mint(protocol.get('convexPoolMock') as string, ethers.utils.parseEther('100000'))
    await cvx.mint(protocol.get('convexPoolMock') as string, ethers.utils.parseEther('100000'))
  }

  await cvx3Crv.transfer(user2.address, ethers.utils.parseEther('10'))

  const cvx3CrvBalanceBefore = await cvx3Crv.balanceOf(cvx3CrvWhaleAcc.address)
  console.log(`${cvx3CrvBalanceBefore} cvx3Crv available`)

  const join = (await ethers.getContractAt('Join', await ladle.joins(CVX3CRV), cvx3CrvWhaleAcc)) as Join
  console.log(join.address)
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

    await ladle
      .connect(user2)
      .batch([
        ladle.connect(user2).buildAction(seriesId, CVX3CRV),
        ladle.connect(user2).moduleCallAction(convexLadleModule.address, addVaultCall),
      ])

    const logs = await cauldron.queryFilter(cauldron.filters.VaultBuilt(null, null, null, null))
    const vaultId = logs[logs.length - 2].args.vaultId
    const vaultId2 = logs[logs.length - 1].args.vaultId
    console.log(`vault: ${vaultId}`)
    const cvx3CrvBefore = (await cvx3Crv.balanceOf(cvx3CrvWhaleAcc.address)).toString()

    // Post CVX3CRV and borrow fyDAI
    await cvx3Crv.approve(ladle.address, posted)
    await cvx3Crv.connect(user2).approve(ladle.address, posted)

    var wrapCall = convexStakingWrapperYield.interface.encodeFunctionData('wrap', [join.address, cvx3CrvWhale])

    await ladle.batch([
      ladle.transferAction(cvx3Crv.address, convexStakingWrapperYield.address, posted),
      ladle.routeAction(convexStakingWrapperYield.address, wrapCall),
      ladle.pourAction(vaultId, cvx3CrvWhaleAcc.address, posted, borrowed),
    ])

    wrapCall = convexStakingWrapperYield.interface.encodeFunctionData('wrap', [join.address, user2.address])

    await ladle
      .connect(user2)
      .batch([
        ladle.connect(user2).transferAction(cvx3Crv.address, convexStakingWrapperYield.address, posted),
        ladle.connect(user2).routeAction(convexStakingWrapperYield.address, wrapCall),
        ladle.connect(user2).pourAction(vaultId2, user2.address, posted, borrowed),
      ])

    if ((await cauldron.balances(vaultId)).art.toString() !== borrowed.toString()) throw 'art mismatch'
    if ((await cauldron.balances(vaultId)).ink.toString() !== posted.toString()) throw 'ink mismatch'

    var crvBefore = await crv.balanceOf(cvx3CrvWhaleAcc.address)
    var cvxBefore = await cvx.balanceOf(cvx3CrvWhaleAcc.address)
    // Claim CVX & CRV reward
    console.log('Claiming Reward')
    await convexStakingWrapperYield.getReward(cvx3CrvWhaleAcc.address)
    var crvAfter = await crv.balanceOf(cvx3CrvWhaleAcc.address)
    var cvxAfter = await cvx.balanceOf(cvx3CrvWhaleAcc.address)
    console.log(crvAfter.toString())
    console.log("Earned "+crvAfter.sub(crvBefore).toString())
    if (crvBefore.gt(crvAfter)) throw 'Reward claim failed'
    if (cvxBefore.gt(cvxAfter)) throw 'Reward claim failed'

    crvBefore = await crv.balanceOf(user2.address)
    cvxBefore = await cvx.balanceOf(user2.address)
    await convexStakingWrapperYield.connect(user2).getReward(user2.address)
    crvAfter = await crv.balanceOf(user2.address)
    cvxAfter = await cvx.balanceOf(user2.address)
    console.log(crvAfter.toString())
    console.log("Earned "+crvAfter.sub(crvBefore).toString())
    console.log('Reward Claimed')

    // Repay fyDai and withdraw cvx3Crv
    await fyToken.transfer(fyToken.address, borrowed)
    await fyToken.connect(user2).transfer(fyToken.address, borrowed)

    var unwrapCall = convexStakingWrapperYield.interface.encodeFunctionData('unwrap', [cvx3CrvWhale])
    var preUnwrapCall = convexStakingWrapperYield.interface.encodeFunctionData('user_checkpoint', [
      ['0x0000000000000000000000000000000000000000', cvx3CrvWhale],
    ])

    await ladle.batch([
      ladle.routeAction(convexStakingWrapperYield.address, preUnwrapCall),
      ladle.pourAction(vaultId, convexStakingWrapperYield.address, posted.mul(-1), borrowed.mul(-1)),
      ladle.routeAction(convexStakingWrapperYield.address, unwrapCall),
    ])

    unwrapCall = convexStakingWrapperYield.interface.encodeFunctionData('unwrap', [user2.address])
    preUnwrapCall = convexStakingWrapperYield.interface.encodeFunctionData('user_checkpoint', [
      ['0x0000000000000000000000000000000000000000', user2.address],
    ])

    await ladle
      .connect(user2)
      .batch([
        ladle.connect(user2).routeAction(convexStakingWrapperYield.address, preUnwrapCall),
        ladle.connect(user2).pourAction(vaultId2, convexStakingWrapperYield.address, posted.mul(-1), borrowed.mul(-1)),
        ladle.connect(user2).routeAction(convexStakingWrapperYield.address, unwrapCall),
      ])

    console.log(`repaid and withdrawn`)
    const cvx3CrvAfter = (await cvx3Crv.balanceOf(cvx3CrvWhaleAcc.address)).toString()
    console.log(`${cvx3CrvAfter} cvx3Crv after`)
    if (cvx3CrvAfter !== cvx3CrvBefore) throw 'cvx3Crv balance mismatch'

    // Claim leftover rewards
    crvBefore = await crv.balanceOf(cvx3CrvWhaleAcc.address)
    cvxBefore = await cvx.balanceOf(cvx3CrvWhaleAcc.address)
    await convexStakingWrapperYield.getReward(cvx3CrvWhaleAcc.address)
    crvAfter = await crv.balanceOf(cvx3CrvWhaleAcc.address)
    cvxAfter = await cvx.balanceOf(cvx3CrvWhaleAcc.address)
    console.log("Earned "+crvAfter.sub(crvBefore).toString())
    console.log(crvAfter.toString())
    if (crvBefore.gt(crvAfter)) throw 'Reward claim failed'
    if (cvxBefore.gt(cvxAfter)) throw 'Reward claim failed'

    crvBefore = await crv.balanceOf(user2.address)
    cvxBefore = await cvx.balanceOf(user2.address)
    await convexStakingWrapperYield.getReward(user2.address)
    crvAfter = await crv.balanceOf(user2.address)
    cvxAfter = await cvx.balanceOf(user2.address)
    console.log("Earned "+crvAfter.sub(crvBefore).toString())
    console.log(crvAfter.toString())
    if (crvBefore.gt(crvAfter)) throw 'Reward claim failed'
    if (cvxBefore.gt(cvxAfter)) throw 'Reward claim failed'
    console.log('Claimed leftover reward')
    // console.log((await crv.balanceOf(join.address)).toString())
  }
  console.log("Amount CRV left in wrapper: "+(await crv.balanceOf(convexStakingWrapperYield.address)).toString())
  console.log("Amount CVX left in wrapper: "+(await cvx.balanceOf(convexStakingWrapperYield.address)).toString())
})()

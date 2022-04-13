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
  ConvexJoin,
  ConvexModule__factory,
} from '../../../../typechain'
import { ConvexJoinInterface } from '../../../../typechain/ConvexJoin'
import { CVX3CRV, WAD, FYDAI2203, FYDAI2206, FYUSDC2203, FYUSDC2206 } from '../../../../shared/constants'
// import { cvx3CrvAddress, crv as crvAddress, cvxAddress } from './addCvx3Crv.config'
const { cvx3CrvAddress, crv, cvxAddress } = require(process.env.CONF as string)
/**
 * @dev This script tests cvx3Crv as a collateral
 */
import { LadleWrapper } from '../../../../shared/ladleWrapper'
// import { ConvexYieldWrapper } from '../../../../typechain/ConvexYieldWrapper'
import { ConvexModule } from '../../../../typechain/ConvexModule'
;(async () => {
  const chainId = await getOriginalChainId()
  if (!(chainId === 1 || chainId === 4 || chainId === 42)) throw 'Only Kovan, Rinkeby and Mainnet supported'

  const seriesIds: Array<string> = [FYDAI2206, FYUSDC2206]
  const protocol = readAddressMappingIfExists('protocol.json')

  // Impersonate cvx3Crv whale 0xd7a029db2585553978190db5e85ec724aa4df23f
  const cvx3CrvWhale = '0xf5b9a5159cb45efcba4f499b7b19667eaa649134'
  const cvx3CrvWhaleAcc = await impersonate(cvx3CrvWhale, WAD)

  const user2 = await impersonate('0x689440f2ff927e1f24c72f1087e1faf471ece1c8', WAD)
  const rescueAccount = await impersonate('0x7ffB5DeB7eb13020aa848bED9DE9222E8F42Fd9A', WAD)
  const deployer = await impersonate('0x3b870db67a45611CF4723d44487EAF398fAc51E3', WAD)

  const cvx3Crv = (await ethers.getContractAt(
    'contracts/::mocks/ERC20Mock.sol:ERC20Mock',
    cvx3CrvAddress,
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

  // const convexYieldWrapper = (await ethers.getContractAt(
  //   'ConvexYieldWrapper',
  //   protocol.get('convexYieldWrapper') as string,
  //   cvx3CrvWhaleAcc
  // )) as unknown as ConvexYieldWrapper

  const convexLadleModule = (await ethers.getContractAt(
    'ConvexModule',
    protocol.get('convexLadleModule') as string,
    cvx3CrvWhaleAcc
  )) as unknown as ConvexModule

  const crvToken = (await ethers.getContractAt(
    'contracts/::mocks/ERC20Mock.sol:ERC20Mock',
    crv,
    cvx3CrvWhaleAcc
  )) as unknown as ERC20Mock

  const cvx = (await ethers.getContractAt(
    'contracts/::mocks/ERC20Mock.sol:ERC20Mock',
    cvxAddress,
    cvx3CrvWhaleAcc
  )) as unknown as ERC20Mock

  // If Kovan then provide necessary tokens to the whale & pool
  if (chainId === 4) {
    await cvx3Crv.mint(cvx3CrvWhale, ethers.utils.parseEther('100000'))
    await cvx3Crv.mint(user2.address, ethers.utils.parseEther('200000'))
    await crvToken.mint(protocol.get('convexPoolMock') as string, ethers.utils.parseEther('100000'))
    await cvx.mint(protocol.get('convexPoolMock') as string, ethers.utils.parseEther('100000'))
  }
  await cvx3Crv.connect(user2).transfer(cvx3CrvWhale, ethers.utils.parseEther('100000'))
  const cvx3CrvBalanceBefore = await cvx3Crv.balanceOf(cvx3CrvWhaleAcc.address)
  console.log(`${cvx3CrvBalanceBefore} cvx3Crv available`)

  const join = (await ethers.getContractAt('ConvexJoin', await ladle.joins(CVX3CRV), cvx3CrvWhaleAcc)) as ConvexJoin

  // Batch action to build a vault & add it to the wrapper
  const addVaultCall = convexLadleModule.interface.encodeFunctionData('addVault', [
    join.address,
    '0x000000000000000000000000',
  ])

  console.log('join ' + join.address)

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
    await cvx3Crv.connect(cvx3CrvWhaleAcc).approve(ladle.address, posted)
    await cvx3Crv.connect(user2).approve(ladle.address, posted)

    let checkpoint = join.interface.encodeFunctionData('checkpoint', [cvx3CrvWhale])
    
    console.log('Allowance ' + (await cvx3Crv.allowance(cvx3CrvWhaleAcc.address, ladle.address)).toString())
    
    await ladle
      .connect(cvx3CrvWhaleAcc)
      .batch([
        ladle.connect(cvx3CrvWhaleAcc).transferAction(cvx3Crv.address, join.address, posted),
        ladle.connect(cvx3CrvWhaleAcc).pourAction(vaultId, cvx3CrvWhaleAcc.address, posted, borrowed),
        
      ])

    
    
    checkpoint = join.interface.encodeFunctionData('checkpoint', [user2.address])
    await ladle
      .connect(user2)
      .batch([
        ladle.connect(user2).transferAction(cvx3Crv.address, join.address, posted),
        ladle.connect(user2).pourAction(vaultId2, user2.address, posted, borrowed),
        
      ])

    if ((await cauldron.balances(vaultId)).art.toString() !== borrowed.toString()) throw 'art mismatch'
    if ((await cauldron.balances(vaultId)).ink.toString() !== posted.toString()) throw 'ink mismatch'

    // if ((await cauldron.balances(vaultId2)).art.toString() !== borrowed.toString()) throw 'art mismatch'
    // if ((await cauldron.balances(vaultId2)).ink.toString() !== posted.toString()) throw 'ink mismatch'
    console.log('Borrowed Successfully')
    var crvBefore = await crvToken.balanceOf(cvx3CrvWhaleAcc.address)
    var cvxBefore = await cvx.balanceOf(cvx3CrvWhaleAcc.address)
    // console.log(await join.earned(cvx3CrvWhaleAcc.address))
    // console.log(await join.earned(user2.address))
    await network.provider.send('evm_increaseTime', [86400 * 14])
    await network.provider.send('evm_mine')
    // Claim CVX & CRV reward
    console.log('Claiming Reward')
    await join.getReward(cvx3CrvWhaleAcc.address)
    var crvAfter = await crvToken.balanceOf(cvx3CrvWhaleAcc.address)
    var cvxAfter = await cvx.balanceOf(cvx3CrvWhaleAcc.address)
    console.log('User1 ' + crvAfter.toString())
    console.log('Earned ' + crvAfter.sub(crvBefore).toString())
    if (crvBefore.gt(crvAfter)) throw 'Reward claim failed'
    if (cvxBefore.gt(cvxAfter)) throw 'Reward claim failed'

    crvBefore = await crvToken.balanceOf(user2.address)
    cvxBefore = await cvx.balanceOf(user2.address)
    await join.connect(user2).getReward(user2.address)
    crvAfter = await crvToken.balanceOf(user2.address)
    cvxAfter = await cvx.balanceOf(user2.address)
    console.log('User2 ' + crvAfter.toString())
    console.log('Earned ' + crvAfter.sub(crvBefore).toString())
    console.log('Reward Claimed')

    // Repay fyDai and withdraw cvx3Crv
    await fyToken.transfer(fyToken.address, borrowed)
    await fyToken.connect(user2).transfer(fyToken.address, borrowed)

    await join.getReward(cvx3CrvWhaleAcc.address)
    await join.getReward(user2.address)
    checkpoint = join.interface.encodeFunctionData('checkpoint', [cvx3CrvWhale])
    await ladle
      .connect(cvx3CrvWhaleAcc)
      .batch([
        ladle.connect(cvx3CrvWhaleAcc).routeAction(join.address, checkpoint),
        ladle.connect(cvx3CrvWhaleAcc).pourAction(vaultId, cvx3CrvWhaleAcc.address, posted.mul(-1), borrowed.mul(-1)),
      ])
    checkpoint = join.interface.encodeFunctionData('checkpoint', [user2.address])
    await ladle
      .connect(user2)
      .batch([
        ladle.connect(user2).routeAction(join.address, checkpoint),
        ladle.connect(user2).pourAction(vaultId2, user2.address, posted.mul(-1), borrowed.mul(-1)),
      ])
    
    console.log(`repaid and withdrawn`)
    const cvx3CrvAfter = (await cvx3Crv.balanceOf(cvx3CrvWhaleAcc.address)).toString()
    console.log(`${cvx3CrvBefore} cvx3Crv before`)
    console.log(`${cvx3CrvAfter} cvx3Crv after`)
    if (cvx3CrvAfter !== cvx3CrvBefore) throw 'cvx3Crv balance mismatch'

    // Claim leftover rewards
    crvBefore = await crvToken.balanceOf(cvx3CrvWhaleAcc.address)
    cvxBefore = await cvx.balanceOf(cvx3CrvWhaleAcc.address)
    await join.getReward(cvx3CrvWhaleAcc.address)
    crvAfter = await crvToken.balanceOf(cvx3CrvWhaleAcc.address)
    cvxAfter = await cvx.balanceOf(cvx3CrvWhaleAcc.address)
    console.log('Earned ' + crvAfter.sub(crvBefore).toString())
    console.log('User1 ' + crvAfter.toString())
    if (crvBefore.gt(crvAfter)) throw 'Reward claim failed'
    if (cvxBefore.gt(cvxAfter)) throw 'Reward claim failed'

    crvBefore = await crvToken.balanceOf(user2.address)
    cvxBefore = await cvx.balanceOf(user2.address)
    await join.getReward(user2.address)
    crvAfter = await crvToken.balanceOf(user2.address)
    cvxAfter = await cvx.balanceOf(user2.address)
    console.log('Earned ' + crvAfter.sub(crvBefore).toString())
    console.log('User2 ' + crvAfter.toString())
    if (crvBefore.gt(crvAfter)) throw 'Reward claim failed'
    if (cvxBefore.gt(cvxAfter)) throw 'Reward claim failed'
    console.log('Claimed leftover reward')
  }
  console.log('Amount CRV left in join: ' + (await crvToken.balanceOf(join.address)).toString())
  console.log('Amount CVX left in join: ' + (await cvx.balanceOf(join.address)).toString())
})()

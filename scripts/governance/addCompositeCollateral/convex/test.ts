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
  IBaseReward,
} from '../../../../typechain'
import {
  ETH,
  DAI,
  USDC,
  WBTC,
  WSTETH,
  STETH,
  LINK,
  ENS,
  UNI,
  YVUSDC,
  MKR,
  FDAI2203,
  FDAI2206,
  FUSDC2203,
  FUSDC2206,
} from '../../../../shared/constants'
import { CVX3CRV, WAD, FYDAI2203, FYDAI2206, FYUSDC2203, FYUSDC2206 } from '../../../../shared/constants'
import { cvx3CrvAddress, crv as crvAddress, cvxAddress, cvxBaseRewardPool } from './addCvx3Crv.config'
/**
 * @dev This script tests cvx3Crv as a collateral
 */
import { LadleWrapper } from '../../../../shared/ladleWrapper'
// import { ConvexYieldWrapper } from '../../../../typechain/ConvexYieldWrapper'
import { ConvexModule } from '../../../../typechain/ConvexModule'

;(async () => {
  console.log(ETH)
  console.log(DAI)
  console.log(USDC)
  console.log(WBTC)
  console.log(WSTETH)
  console.log(STETH)
  console.log(LINK)
  console.log(ENS)
  console.log(UNI)
  console.log(YVUSDC)
  console.log(UNI)
  console.log(MKR)
  console.log(FDAI2203)
  console.log(FDAI2206)
  console.log(FUSDC2203)
  console.log(FUSDC2206)
  console.log(CVX3CRV)
  // const chainId = await getOriginalChainId()
  // if (!(chainId === 1 || chainId === 4 || chainId === 42)) throw 'Only Kovan, Rinkeby and Mainnet supported'

  // const seriesIds: Array<string> = [FYDAI2203, FYDAI2206, FYUSDC2203, FYUSDC2206]
  // const protocol = readAddressMappingIfExists('protocol.json')

  // // Impersonate cvx3Crv whale 0xd7a029db2585553978190db5e85ec724aa4df23f
  // const cvx3CrvWhale = '0xf5b9a5159cb45efcba4f499b7b19667eaa649134'
  // const cvx3CrvWhaleAcc = await impersonate(cvx3CrvWhale, WAD)

  // const user2 = await impersonate('0x7ffB5DeB7eb13020aa848bED9DE9222E8F42Fd9A', WAD)
  // const rescueAccount = await impersonate('0x7ffB5DeB7eb13020aa848bED9DE9222E8F42Fd9A', WAD)
  // const deployer = await impersonate('0x3b870db67a45611CF4723d44487EAF398fAc51E3', WAD)

  // const cvx3Crv = (await ethers.getContractAt(
  //   'contracts/::mocks/ERC20Mock.sol:ERC20Mock',
  //   cvx3CrvAddress,
  //   cvx3CrvWhaleAcc
  // )) as unknown as ERC20Mock

  // const cauldron = (await ethers.getContractAt(
  //   'Cauldron',
  //   protocol.get('cauldron') as string,
  //   cvx3CrvWhaleAcc
  // )) as unknown as Cauldron

  // const innerLadle = (await ethers.getContractAt(
  //   'Ladle',
  //   protocol.get('ladle') as string,
  //   cvx3CrvWhaleAcc
  // )) as unknown as Ladle

  // let ladle: LadleWrapper
  // ladle = new LadleWrapper(innerLadle)

  // const oracle = (await ethers.getContractAt(
  //   'CompositeMultiOracle',
  //   protocol.get('compositeOracle') as string,
  //   cvx3CrvWhaleAcc
  // )) as unknown as CompositeMultiOracle

  // const convexYieldWrapper = (await ethers.getContractAt(
  //   'IBaseReward',
  //   cvxBaseRewardPool,
  //   cvx3CrvWhaleAcc
  // )) as unknown as IBaseReward

  // const convexLadleModule = (await ethers.getContractAt(
  //   'ConvexModule',
  //   protocol.get('convexLadleModule') as string,
  //   cvx3CrvWhaleAcc
  // )) as unknown as ConvexModule

  // const crv = (await ethers.getContractAt(
  //   'contracts/::mocks/ERC20Mock.sol:ERC20Mock',
  //   crvAddress,
  //   cvx3CrvWhaleAcc
  // )) as unknown as ERC20Mock

  // const cvx = (await ethers.getContractAt(
  //   'contracts/::mocks/ERC20Mock.sol:ERC20Mock',
  //   cvxAddress,
  //   cvx3CrvWhaleAcc
  // )) as unknown as ERC20Mock

  // // If Kovan then provide necessary tokens to the whale & pool
  // if (chainId === 42) {
  //   await cvx3Crv.mint(cvx3CrvWhale, ethers.utils.parseEther('100000'))
  //   await crv.mint(protocol.get('convexPoolMock') as string, ethers.utils.parseEther('100000'))
  //   await cvx.mint(protocol.get('convexPoolMock') as string, ethers.utils.parseEther('100000'))
  // }

  // await cvx3Crv.transfer(user2.address, ethers.utils.parseEther('10'))

  // const cvx3CrvBalanceBefore = await cvx3Crv.balanceOf(cvx3CrvWhaleAcc.address)
  // console.log(`${cvx3CrvBalanceBefore} cvx3Crv available`)

  // const join = (await ethers.getContractAt('ConvexJoin', await ladle.joins(CVX3CRV), cvx3CrvWhaleAcc)) as ConvexJoin
  // console.log(join.address)
  // // Batch action to build a vault & add it to the wrapper
  // const addVaultCall = convexLadleModule.interface.encodeFunctionData('addVault', [
  //   join.address,
  //   '0x000000000000000000000000',
  // ])
  // await cvx3Crv.connect(user2).approve(convexYieldWrapper.address, ethers.utils.parseEther('1'))
  // await convexYieldWrapper.connect(user2).stake(ethers.utils.parseEther('1'))
  // console.log('join ' + join.address)
  // console.log('crv ' + (await crv.balanceOf(user2.address)).toString())
  // console.log('cvx ' + (await cvx.balanceOf(user2.address)).toString())
  // await convexYieldWrapper.connect(user2).getReward(user2.address, true)
  // console.log('crv ' + (await crv.balanceOf(user2.address)).toString())
  // console.log('cvx ' + (await cvx.balanceOf(user2.address)).toString())
  // console.log('---------------------WHALE---------------------')
  // await cvx3Crv.approve(convexYieldWrapper.address, ethers.utils.parseEther('1'))
  // await convexYieldWrapper.stake(ethers.utils.parseEther('1'))
  // console.log('join ' + join.address)
  // console.log('crv ' + (await crv.balanceOf(cvx3CrvWhaleAcc.address)).toString())
  // console.log('cvx ' + (await cvx.balanceOf(cvx3CrvWhaleAcc.address)).toString())
  // await convexYieldWrapper.getReward(cvx3CrvWhaleAcc.address, true)
  // console.log('crv ' + (await crv.balanceOf(cvx3CrvWhaleAcc.address)).toString())
  // console.log('cvx ' + (await cvx.balanceOf(cvx3CrvWhaleAcc.address)).toString())
})()

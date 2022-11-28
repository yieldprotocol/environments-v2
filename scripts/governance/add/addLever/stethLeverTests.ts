import { ethers } from 'hardhat'
import {
  Timelock,
  Giver,
  YieldStEthLever,
  IPool,
  Ladle,
  FYToken,
  FlashJoin,
  Cauldron,
  ERC20,
} from '../../../../typechain'
import { getOwnerOrImpersonate, impersonate } from '../../../../shared/helpers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { BigNumber } from 'ethers'
const { developer, deployer } = require(process.env.CONF as string)
const { protocol, governance } = require(process.env.CONF as string)

/**
 * @dev This script orchestrates the YieldStEthLever
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)
  const timelock = (await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc)) as Timelock
  const giver = (await ethers.getContractAt('Giver', protocol.get('giver') as string, ownerAcc)) as Giver
  const yieldStEthLever = (await ethers.getContractAt(
    'YieldStEthLever',
    protocol.get('yieldStEthLever') as string,
    ownerAcc
  )) as YieldStEthLever
  const weth = (await ethers.getContractAt('ERC20', '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', ownerAcc)) as ERC20
  const ladle = (await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as Ladle
  const cauldron = (await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc)) as Cauldron
  let timelockAcc: SignerWithAddress
  timelockAcc = await impersonate(timelock.address, BigNumber.from('1000000000000000000'))
  const seriesId = '0x303030380000'

  let pool: any = await ethers.getContractAt(
    '@yield-protocol/yieldspace-tv/src/interfaces/IPool.sol:IPool',
    await ladle.pools(seriesId),
    ownerAcc
  )
  let fyToken: FYToken = (await ethers.getContractAt('FYToken', await pool.fyToken(), ownerAcc)) as FYToken

  let stableSwap: any = await ethers.getContractAt(
    'contracts/interfaces/IStableSwap.sol:IStableSwap',
    '0x828b154032950C8ff7CF8085D841723Db2696056',
    ownerAcc
  )

  let wethJoin: FlashJoin = await ethers.getContractAt(
    'FlashJoin',
    '0x3bDb887Dc46ec0E964Df89fFE2980db0121f0fD0',
    ownerAcc
  )
  let usdcJoin: FlashJoin = await ethers.getContractAt(
    'FlashJoin',
    '0x0d9A1A773be5a83eEbda23bf98efB8585C3ae4f4',
    ownerAcc
  )
  let daiJoin: FlashJoin = await ethers.getContractAt(
    'FlashJoin',
    '0x4fE92119CDf873Cf8826F4E6EcfD4E578E3D44Dc',
    ownerAcc
  )

  let signerAcc: SignerWithAddress
  signerAcc = await impersonate('0x030bA81f1c18d280636F32af80b9AAd02Cf0854e', BigNumber.from('1000000000000000000'))

  //   await yieldStEthLever.approveFyToken(seriesId)
  //   await fyToken.connect(timelockAcc).setFlashFeeFactor(1)

  //   await wethJoin.connect(timelockAcc).setFlashFeeFactor(1)
  //   await usdcJoin.connect(timelockAcc).setFlashFeeFactor(1)
  //   await daiJoin.connect(timelockAcc).setFlashFeeFactor(1)

  //   await weth.connect(signerAcc).approve(yieldStEthLever.address, '80000000000000000000')

  let baseAmount: BigNumber = BigNumber.from('1000000000000000000')
  let borrowAmount: BigNumber = BigNumber.from('3500000000000000000')
  console.log('here')
  let wethAmount = await pool.sellFYTokenPreview(baseAmount.add(borrowAmount))
  console.log('here 1')
  let minCollateral = await stableSwap.get_dy(0, 1, wethAmount)
  console.log('here 2')
  minCollateral = minCollateral.mul(80).div(100)
  await yieldStEthLever.connect(signerAcc).invest(seriesId, borrowAmount, minCollateral)
})()

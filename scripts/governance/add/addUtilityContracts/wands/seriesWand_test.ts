import { ethers } from 'hardhat'

import { bytesToBytes32, deploy, getOwnerOrImpersonate } from '../../../../../shared/helpers'
import {
  Cauldron,
  ChainlinkMultiOracle,
  EmergencyBrake,
  ERC20Mock,
  FYToken,
  Giver,
  Join,
  Ladle,
  Pool,
  SeriesWand,
  Witch,
  YieldMath,
} from '../../../../../typechain'
import SeriesWandArtifact from '../../../../../artifacts/contracts/wands/SeriesWand.sol/SeriesWand.json'
import YieldMathArtifact from '../../../../../artifacts/@yield-protocol/yieldspace-v2/contracts/YieldMath.sol/YieldMath.json'
import { DAI, ETH, USDC, WAD } from '../../../../../shared/constants'
const { developer, whales } = require(process.env.CONF as string)
const { protocol, governance } = require(process.env.CONF as string)
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { id } from '../../../../../shared/helpers'
import { BigNumber } from 'ethers'

describe('Series Wand', function () {
  let ladle: Ladle
  let witch: Witch
  let yieldMath: YieldMath
  let ownerAcc: SignerWithAddress
  let timeLockAcc: SignerWithAddress
  let cauldron: Cauldron
  let wand: SeriesWand
  let join: Join
  let fyToken: FYToken
  let pool: Pool
  let cloak: EmergencyBrake
  let spotOracle: ChainlinkMultiOracle
  const seriesId3 = ethers.utils.formatBytes32String('0210').slice(0, 14)
  const ONE64 = BigNumber.from('18446744073709551616') // In 64.64 format
  const secondsInOneYear = BigNumber.from(31557600)
  const secondsIn30Years = secondsInOneYear.mul(30) // Seconds in 30 years

  before(async () => {
    const chainlinkOracle = protocol.get('chainlinkOracle') as string
    ownerAcc = await getOwnerOrImpersonate(developer, WAD)
    const timelock = governance.get('timelock') as string
    timeLockAcc = await getOwnerOrImpersonate(timelock, WAD)
    cauldron = (await ethers.getContractAt(
      'Cauldron',
      protocol.get('cauldron') as string,
      ownerAcc
    )) as unknown as Cauldron
    ladle = (await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as unknown as Ladle
    witch = (await ethers.getContractAt('Witch', protocol.get('witch') as string, ownerAcc)) as unknown as Witch
    cloak = (await ethers.getContractAt(
      'EmergencyBrake',
      governance.get('cloak') as string,
      ownerAcc
    )) as unknown as EmergencyBrake
    spotOracle = (await ethers.getContractAt(
      'ChainlinkMultiOracle',
      chainlinkOracle,
      ownerAcc
    )) as unknown as ChainlinkMultiOracle
    wand = await deploy(ownerAcc, SeriesWandArtifact, [cauldron.address, ladle.address, cloak.address])
    yieldMath = (await deploy(ownerAcc, YieldMathArtifact, [])) as YieldMath
    join = (await ethers.getContractAt('Join', await ladle.joins(USDC))) as Join

    await join.connect(timeLockAcc).grantRoles([id(join.interface, 'grantRoles(bytes4[],address)')], wand.address)

    await join.connect(timeLockAcc).grantRole('0x00000000', wand.address)

    await cauldron
      .connect(timeLockAcc)
      .grantRoles(
        [
          id(cauldron.interface, 'addSeries(bytes6,bytes6,address)'),
          id(cauldron.interface, 'addIlks(bytes6,bytes6[])'),
        ],
        wand.address
      )

    await ladle.connect(timeLockAcc).grantRoles([id(ladle.interface, 'addPool(bytes6,address)')], wand.address)

    await wand.grantRole(id(wand.interface, 'addSeries(bytes6,bytes6,bytes6[],address,address)'), ownerAcc.address)

    await cloak
      .connect(timeLockAcc)
      .grantRoles([id(cloak.interface, 'plan(address,(address,bytes4[])[])')], wand.address)

    await cloak.connect(timeLockAcc).grantRole('0x00000000', wand.address)
    //Deploy Fytoken
    const fyTokenFactory = await ethers.getContractFactory('FYToken', {
      libraries: {
        SafeERC20Namer: protocol.get('safeERC20Namer') as string,
      },
    })

    fyToken = (await fyTokenFactory.deploy(
      USDC,
      chainlinkOracle,
      join.address,
      BigNumber.from('1680271200'), // Maturity
      'temp', // Name
      'temp' // Symbol
    )) as unknown as FYToken

    await fyToken.grantRole('0x00000000', wand.address)
    //Deploy Pool
    const PoolFactory = await ethers.getContractFactory('Pool', {
      libraries: {
        YieldMath: yieldMath.address,
      },
    })
    pool = (await PoolFactory.deploy(
      await cauldron.assets(USDC),
      fyToken.address,
      ONE64.div(secondsIn30Years), // Timestretch
      ONE64.mul(75).div(100),
      ONE64.mul(100).div(75)
    )) as unknown as Pool
  })

  it('Create a series', async () => {
    await wand.connect(ownerAcc).addSeries(
      seriesId3, // seriesId
      USDC, // baseId
      [DAI, ETH], // Ilks
      fyToken.address,
      pool.address
    )
    const seriesdata = await cauldron.series(seriesId3)

    expect(seriesdata[0]).to.be.eq(fyToken.address)
    expect(seriesdata[1]).to.be.eq(USDC)
    expect(seriesdata[2]).to.be.eq(BigNumber.from('1680271200'))
  })

  it('Borrow test', async () => {
    let ilk = ETH
    var collateral = (await ethers.getContractAt(
      'ERC20Mock',
      await cauldron.callStatic.assets(ilk),
      ownerAcc
    )) as unknown as ERC20Mock

    // Whale
    let collateralWhale = await getOwnerOrImpersonate(whales.get(ETH), WAD.mul(1000))
    await collateral.connect(collateralWhale).transfer(ownerAcc.address, WAD.mul(1000))

    console.log(`series: ${seriesId3}`)
    console.log(`ilk: ${ilk}`)
    const series = await cauldron.series(seriesId3)

    const fyToken = (await ethers.getContractAt('FYToken', series.fyToken, ownerAcc)) as unknown as FYToken

    const dust = (await cauldron.debt(series.baseId, ilk)).min
    const ratio = (await cauldron.spotOracles(series.baseId, ilk)).ratio
    var borrowed = BigNumber.from(10)
      .pow(await fyToken.decimals())
      .mul(dust)

    const posted = (await spotOracle?.peek(bytesToBytes32(series.baseId), bytesToBytes32(ilk), borrowed))[0]
      .mul(ratio)
      .div(1000000)
      .mul(101)
      .div(100)

    const collateralBalanceBefore = await collateral.balanceOf(ownerAcc.address)

    // Build vault
    await ladle.connect(ownerAcc).build(seriesId3, ilk, 0)
    const logs = await cauldron.queryFilter(cauldron.filters.VaultBuilt(null, null, null, null))
    const vaultId = logs[logs.length - 1].args.vaultId
    console.log(`vault: ${vaultId}`)

    var name = await fyToken.callStatic.name()
    // Post collateral and borrow
    const collateralJoinAddress = await ladle.joins(ilk)

    console.log(`posting ${posted} ilk out of ${await collateral.balanceOf(ownerAcc.address)}`)
    await collateral.connect(ownerAcc).transfer(collateralJoinAddress, posted)
    console.log(`borrowing ${borrowed} ${name}`)
    await ladle.connect(ownerAcc).pour(vaultId, ownerAcc.address, posted, borrowed)
    console.log(`posted and borrowed`)

    if ((await cauldron.balances(vaultId)).art.toString() !== borrowed.toString()) throw 'art mismatch'
    if ((await cauldron.balances(vaultId)).ink.toString() !== posted.toString()) throw 'ink mismatch'

    // Repay fyFRAX and withdraw collateral
    await fyToken.connect(ownerAcc).transfer(fyToken.address, borrowed)
    console.log(`repaying ${borrowed} ${name} and withdrawing ${posted} ilk`)
    await ladle.connect(ownerAcc).pour(vaultId, ownerAcc.address, posted.mul(-1), borrowed.mul(-1))
    console.log(`repaid and withdrawn`)
    expect(await collateral.balanceOf(ownerAcc.address)).to.be.eq(collateralBalanceBefore)
  })
})

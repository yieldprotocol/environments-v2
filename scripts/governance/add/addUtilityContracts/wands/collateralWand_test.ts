import { ethers } from 'hardhat'

import { bytesToBytes32, deploy, getOwnerOrImpersonate } from '../../../../../shared/helpers'
import {
  Cauldron,
  ChainlinkMultiOracle,
  ChainlinkCollateralWand,
  EmergencyBrake,
  ERC20Mock,
  FYToken,
  Join,
  Ladle,
  OracleMock,
  Witch,
} from '../../../../../typechain'
import ChainlinkCollateralWandArtifact from '../../../../../artifacts/contracts/wands/ChainlinkCollateralWand.sol/ChainlinkCollateralWand.json'
import { FYUSDC2209, USDC, WAD } from '../../../../../shared/constants'
const { developer } = require(process.env.CONF as string)
const { protocol, governance } = require(process.env.CONF as string)
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { deployContract } from 'ethereum-waffle'
import ERC20MockArtifact from '../../../../../artifacts/contracts/::mocks/ERC20Mock.sol/ERC20Mock.json'
import JoinArtifact from '../../../../../artifacts/@yield-protocol/vault-v2/contracts/Join.sol/Join.json'
import ChainlinkAggregatorV3MockArtifact from '../../../../../artifacts/contracts/::mocks/ChainlinkAggregatorV3Mock.sol/ChainlinkAggregatorV3Mock.json'
import { ChainlinkAggregatorV3Mock } from '../../../../../typechain'
import { id } from '@yield-protocol/utils-v2'
import { BigNumber } from 'ethers'
import { JsonRpcSigner } from '@ethersproject/providers'

describe('CollateralWand', function () {
  let collateralWand: ChainlinkCollateralWand
  let ownerAcc: SignerWithAddress
  let timeLockAcc: SignerWithAddress
  let dummy: SignerWithAddress
  let join: Join
  let asset: ERC20Mock
  let chainlinkAggregator: ChainlinkAggregatorV3Mock
  let cauldron: Cauldron
  let ladle: Ladle
  let witch: Witch
  let cloak: EmergencyBrake
  let spotOracle: ChainlinkMultiOracle
  const assetId = ethers.utils.formatBytes32String('100').slice(0, 14)
  before(async () => {
    ownerAcc = await getOwnerOrImpersonate(developer, WAD)

    let [temp] = await ethers.getSigners()
    dummy = temp

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

    const chainlinkOracle = protocol.get('chainlinkOracle') as string
    const timelock = governance.get('timelock') as string
    timeLockAcc = await getOwnerOrImpersonate(timelock, WAD)

    collateralWand = await deploy(ownerAcc, ChainlinkCollateralWandArtifact, [
      cauldron.address,
      ladle.address,
      witch.address,
      cloak.address,
      chainlinkOracle,
    ])

    // Create mock asset
    asset = (await deployContract(ownerAcc, ERC20MockArtifact, ['Asset Name', 'Asset Symbol'])) as ERC20Mock

    // Create mock chainlink source
    chainlinkAggregator = (await deployContract(ownerAcc, ChainlinkAggregatorV3MockArtifact, [
      18,
    ])) as ChainlinkAggregatorV3Mock
    await chainlinkAggregator.set('341800000000000')
    // Create join for the asset
    join = (await deployContract(ownerAcc, JoinArtifact, [asset.address])) as Join

    // Setting permissions
    await collateralWand.grantRole(
      id(
        collateralWand.interface,
        'addChainlinkCollateral(bytes6,address,address,(bytes6,address,address),(bytes6,uint32,uint64,uint96,uint24,uint8),(bytes6,bytes6,uint32,uint96,uint24,uint8)[],(bytes6,bytes6[])[])'
      ),
      ownerAcc.address
    )

    await collateralWand.grantRole(id(collateralWand.interface, 'shutDown(bool)'), ownerAcc.address)
    await join.grantRoles([id(join.interface, 'grantRoles(bytes4[],address)')], collateralWand.address)
    await join.grantRole('0x00000000', collateralWand.address)

    await cauldron
      .connect(timeLockAcc)
      .grantRoles(
        [
          id(cauldron.interface, 'addAsset(bytes6,address)'),
          id(cauldron.interface, 'addIlks(bytes6,bytes6[])'),
          id(cauldron.interface, 'setSpotOracle(bytes6,bytes6,address,uint32)'),
          id(cauldron.interface, 'setDebtLimits(bytes6,bytes6,uint96,uint24,uint8)'),
        ],
        collateralWand.address
      )

    await ladle
      .connect(timeLockAcc)
      .grantRoles([id(ladle.interface, 'addJoin(bytes6,address)')], collateralWand.address)

    spotOracle = (await ethers.getContractAt(
      'ChainlinkMultiOracle',
      chainlinkOracle,
      ownerAcc
    )) as unknown as ChainlinkMultiOracle
    await spotOracle
      .connect(timeLockAcc)
      .grantRole(id(spotOracle.interface, 'setSource(bytes6,address,bytes6,address,address)'), collateralWand.address)

    await cloak
      .connect(timeLockAcc)
      .grantRoles([id(cloak.interface, 'plan(address,(address,bytes4[])[])')], collateralWand.address)

    await cloak.connect(timeLockAcc).grantRole('0x00000000', collateralWand.address)

    await witch
      .connect(timeLockAcc)
      .grantRoles(
        [
          id(witch.interface, 'point(bytes32,address)'),
          id(witch.interface, 'setIlk(bytes6,uint32,uint64,uint96,uint24,uint8)'),
        ],
        collateralWand.address
      )
  })
  it('Wand cannot be shut by somebody without authorization', async () => {
    await expect(collateralWand.connect(dummy).shutDown(true)).to.be.revertedWith('Access denied')
  })

  it('Wand can be shut by somebody with authorization', async () => {
    await collateralWand.connect(ownerAcc).shutDown(true)
    expect(await collateralWand.isShutdown()).to.be.eq(true)
  })

  it("Wand won't work if it is shutdown", async () => {
    await expect(
      collateralWand.addChainlinkCollateral(
        assetId,
        join.address,
        ownerAcc.address,

        {
          quoteId: assetId,
          quote: asset.address,
          source: chainlinkAggregator.address,
        },

        {
          ilkId: assetId,
          duration: 3600,
          initialOffer: '1000000000000000000',
          line: 1000000,
          dust: 5000,
          dec: 18,
        },

        [
          {
            baseId: USDC,
            ilkId: assetId,
            ratio: 1000000,
            line: 10000000,
            dust: 0,
            dec: 18,
          },
        ],
        [
          {
            series: FYUSDC2209,
            ilkIds: [assetId],
          },
        ]
      )
    ).to.be.revertedWith('Wand is shut!')
  })

  it('Wand can be started again by somebody with authorization', async () => {
    await collateralWand.connect(ownerAcc).shutDown(false)
    expect(await collateralWand.isShutdown()).to.be.eq(false)
  })

  it('Add Collateral', async () => {
    await collateralWand.addChainlinkCollateral(
      assetId,
      join.address,
      ownerAcc.address,

      {
        quoteId: assetId,
        quote: asset.address,
        source: chainlinkAggregator.address,
      },

      {
        ilkId: assetId,
        duration: 3600,
        initialOffer: '1000000000000000000',
        line: 1000000,
        dust: 5000,
        dec: 18,
      },

      [
        {
          baseId: USDC,
          ilkId: assetId,
          ratio: 1000000,
          line: 10000000,
          dust: 0,
          dec: 18,
        },
      ],
      [
        {
          series: FYUSDC2209,
          ilkIds: [assetId],
        },
      ]
    )
    expect(await cauldron.ilks(FYUSDC2209, assetId)).to.be.true
  })

  it('Borrow on new collateral', async () => {
    let ilk = assetId
    let seriesId = FYUSDC2209

    await asset.connect(ownerAcc).mint(ownerAcc.address, WAD.mul(1000000000))

    console.log(`series: ${seriesId}`)
    console.log(`ilk: ${ilk}`)
    const series = await cauldron.series(seriesId)

    const fyToken = (await ethers.getContractAt('FYToken', series.fyToken, ownerAcc)) as unknown as FYToken

    const ratio = (await cauldron.spotOracles(series.baseId, ilk)).ratio
    var borrowed = BigNumber.from(10)
      .pow(await fyToken.decimals())
      .mul(10)

    const posted = (await spotOracle?.peek(bytesToBytes32(series.baseId), bytesToBytes32(ilk), borrowed))[0]
      .mul(ratio)
      .div(1000000)
      .mul(101)
      .div(100)

    const collateralBalanceBefore = await asset.balanceOf(ownerAcc.address)

    // Build vault
    await ladle.connect(ownerAcc).build(seriesId, ilk, 0)
    const logs = await cauldron.queryFilter(cauldron.filters.VaultBuilt(null, null, null, null))
    const vaultId = logs[logs.length - 1].args.vaultId
    console.log(`vault: ${vaultId}`)

    var name = await fyToken.callStatic.name()
    // Post collateral and borrow
    const collateralJoinAddress = await ladle.joins(ilk)

    console.log(`posting ${posted} ilk out of ${await asset.balanceOf(ownerAcc.address)}`)
    await asset.connect(ownerAcc).transfer(collateralJoinAddress, posted)
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
    expect(await asset.balanceOf(ownerAcc.address)).to.be.eq(collateralBalanceBefore)
  })
})

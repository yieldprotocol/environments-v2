import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ChainlinkMultiOracle, FlashLiquidator, FlashLiquidator__factory, IOracle, Join, Timelock } from '../typechain'

import { expect } from 'chai'
import { ethers, network } from 'hardhat'
import { BigNumber } from 'ethers'
import { Logger } from 'tslog'

import { LiquidatorConfig, run_liquidator, TestFixture, testSetUp, deployETHSeries } from './utils_liquidator'
import { hardhat_fork as fork } from './utils'

import {
  readAddressMappingIfExists,
  bytesToBytes32,
  impersonate,
  getOriginalChainId,
  getOwnerOrImpersonate,
  proposeApproveExecute,
} from '../shared/helpers'
import { ERC20Mock, Cauldron, Ladle, FYToken, CompositeMultiOracle, WstETHMock } from '../typechain'
import { WSTETH, STETH, ETH, WAD, DAI, FYETH2203 } from '../shared/constants'
import { assets, developer, governance } from '../scripts/governance/addSeries/addEthSeries/addEthSeries.mainnet.config'
import { updateIlkProposal } from '../scripts/fragments/assetsAndSeries/updateIlkProposal'

const logger: Logger = new Logger()

const g_multicall2 = '0x5ba1e12693dc8f9c48aad8770482f4739beed696'
const g_witch = '0x53C3760670f6091E1eC76B4dd27f73ba4CAd5061'
const g_uni_router_02 = '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45'
const g_flash_loaner = '0xBA12222222228d8Ba445958a75a0704d566BF2C8'
const g_port = 8545

async function deploy_flash_liquidator(): Promise<[SignerWithAddress, LiquidatorConfig]> {
  const [owner] = (await ethers.getSigners()) as SignerWithAddress[]

  const flFactory = (await ethers.getContractFactory('FlashLiquidator')) as FlashLiquidator__factory

  const liquidator = (await flFactory.deploy(g_witch, g_uni_router_02, g_flash_loaner)) as FlashLiquidator
  return [
    owner,
    new LiquidatorConfig(g_multicall2, liquidator.address, g_witch, g_uni_router_02, network.config.chainId!, g_port),
  ]
}

describe('flash liquidator: ETH series', function () {
  let fixture: TestFixture = new TestFixture()
  
  const wethWhale = '0x2feb1512183545f48f6b9c5b4ebfcaf49cfca6f3'
  const daiWhale = '0x4967ec98748efb98490663a65b16698069a1eb35'
  const WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'

  testSetUp(this, g_port, fixture)

  it('liquidates the vaults', async function () {
    this.timeout(1800e3)

    await fork(14268289)

    // Execute the proposal to add ETH as borrowable asset
    await deployETHSeries(fixture).catch((e) => {
      throw 'Failed to deploy ETH series'
    })
    console.log('Deployed ETH Series')
    let ownerAcc = await getOwnerOrImpersonate(developer)
    let whaleAcc: SignerWithAddress
    let eth: boolean = true

    const protocol = readAddressMappingIfExists('protocol.json')

    const wEth = (await ethers.getContractAt('ERC20Mock', WETH, ownerAcc)) as unknown as ERC20Mock
    const dai = (await ethers.getContractAt('ERC20Mock', assets.get(DAI) as string, ownerAcc)) as unknown as ERC20Mock
    const cauldron = (await ethers.getContractAt(
      'Cauldron',
      protocol.get('cauldron') as string,
      ownerAcc
    )) as unknown as Cauldron

    const ladle = (await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as unknown as Ladle

    const oracle = (await ethers.getContractAt(
      'ChainlinkMultiOracle',
      protocol.get('chainlinkOracle') as string,
      ownerAcc
    )) as unknown as ChainlinkMultiOracle

    const timelock = (await ethers.getContractAt(
      'Timelock',
      '0x3b870db67a45611CF4723d44487EAF398fAc51E3',
      ownerAcc
    )) as unknown as Timelock

    whaleAcc = await impersonate(eth ? wethWhale : daiWhale, WAD)

    console.log(`series: ${FYETH2203}`)
    const series = await cauldron.series(FYETH2203)
    const fyToken = (await ethers.getContractAt('FYToken', series.fyToken, ownerAcc)) as unknown as FYToken
    const min = (await cauldron.debt(series.baseId, eth ? ETH : DAI)).min
    const dust = min == 0 ? 1000000 : min
    const ratio = (await cauldron.spotOracles(series.baseId, eth ? ETH : DAI)).ratio
    const borrowed = BigNumber.from(10)
      .pow(await fyToken.decimals())
      .mul(dust)
      .div(1000000) // `debt` is defined with 12 decimals for Ether
    const posted = (await oracle.peek(bytesToBytes32(series.baseId), bytesToBytes32(eth ? ETH : DAI), borrowed))[0]
      .mul(ratio)
      .div(1000000)
      .mul(101)
      .div(100) // borrowed * spot * ratio * 1.01 (for margin)
    console.log(await fyToken.symbol())
    console.log(await fyToken.name())
    // Build vault
    await ladle.build(FYETH2203, eth ? ETH : DAI, 0)
    const logs = await cauldron.queryFilter(cauldron.filters.VaultBuilt(null, null, null, null))
    const vaultId = logs[logs.length - 1].args.vaultId
    console.log(`vault: ${vaultId}`)

    // Post wstEth and borrow fyETH
    const wEthJoinAddress = await ladle.joins(eth ? ETH : DAI)

    console.log(`posting ${posted} WETH out of ${await wEth.balanceOf(whaleAcc.address)}`)
    if (eth) await wEth.connect(whaleAcc).transfer(wEthJoinAddress, posted)
    else await dai.connect(whaleAcc).transfer(wEthJoinAddress, posted)
    console.log(`borrowing ${borrowed} fyETH`)
    await ladle.pour(vaultId, whaleAcc.address, posted, borrowed)
    console.log(`posted and borrowed`)

    if ((await cauldron.balances(vaultId)).art.toString() !== borrowed.toString()) throw 'art mismatch'
    if ((await cauldron.balances(vaultId)).ink.toString() !== posted.toString()) throw 'ink mismatch'

    const [_owner, liquidator] = await deploy_flash_liquidator()

    const starting_balance = await _owner.getBalance()
    console.log('Liquidator Run')
    await run_liquidator(fixture, liquidator)
    console.log('Liquidator Run End')
    let bought = 0

    // wait a few hours for auction to release all collateral
    await network.provider.send('evm_increaseTime', [7200])
    await network.provider.send('evm_mine')

    // Build the proposal
    let proposal: Array<{ target: string; data: string }> = []
    proposal = proposal.concat(
      await updateIlkProposal(oracle as unknown as IOracle, cauldron, [
        eth ? [ETH, ETH, 2000000, 2500000000, 0, 12] : [ETH, DAI, 2000000, 1000000000, 1250000, 12],
      ])
    )
    var level = await cauldron.callStatic.level(vaultId)
    console.log('Level before ' + level.toString())

    // Changing the ratio
    await proposeApproveExecute(timelock, proposal, '0xd659565b84bcfcb23b02ee13e46cb51429f4558a')
    await proposeApproveExecute(timelock, proposal, '0xd659565b84bcfcb23b02ee13e46cb51429f4558a')
    await proposeApproveExecute(timelock, proposal, '0xd659565b84bcfcb23b02ee13e46cb51429f4558a')

    level = await cauldron.callStatic.level(vaultId)
    console.log('Level after ' + level.toString())
    console.log('before balance ' + (await wEth.balanceOf(_owner.address)).toString())
    const liquidator_logs = await run_liquidator(fixture, liquidator)
    for (const log_record of liquidator_logs) {
      if (log_record['level'] == 'INFO' && log_record['fields']['message'] == 'Submitted buy order') {
        bought++
      }
      expect(log_record['level']).to.not.equal('ERROR') // no errors allowed
    }
    console.log('after balance ' + (await wEth.balanceOf(_owner.address)).toString())
    expect(bought).to.be.equal(5)
    const final_balance = await _owner.getBalance()
    logger.warn('ETH used: ', starting_balance.sub(final_balance).div(1e12).toString(), 'wETH')
  })
})

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ArbSysMock, ArbSysMock__factory, FlashLiquidator, FlashLiquidator__factory } from '../typechain'

import { expect } from 'chai'
import { ethers, network } from 'hardhat'

import { Logger } from 'tslog'

import { LiquidatorConfig, run_liquidator, TestFixture, testSetUp } from './utils_liquidator'
import { hardhat_fork as fork } from './utils'

const logger: Logger = new Logger()

const g_multicall2 = '0x80c7dd17b01855a6d2347444a0fcc36136a314de'
const g_witch = '0x08173D0885B00BDD640aaE57D05AbB74cd00d669'
const g_uni_router_02 = '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45'
const g_flash_loaner = '0xBA12222222228d8Ba445958a75a0704d566BF2C8'
const g_port = 8555

async function deploy_flash_liquidator(): Promise<[SignerWithAddress, LiquidatorConfig]> {
  const [owner] = (await ethers.getSigners()) as SignerWithAddress[]

  const flFactory = (await ethers.getContractFactory('FlashLiquidator')) as FlashLiquidator__factory

  const liquidator = (await flFactory.deploy(g_witch, g_uni_router_02, g_flash_loaner)) as FlashLiquidator
  logger.info('Liquidator deployed at: ', liquidator.address)
  return [
    owner,
    new LiquidatorConfig(
      g_multicall2,
      liquidator.address,
      g_witch,
      g_uni_router_02,
      network.config.chainId!,
      g_port,
      100000
    ),
  ]
}

describe('flash liquidator: Arbitrum', function () {
  let fixture: TestFixture = new TestFixture()
  fixture.chain_id = 42161

  testSetUp(this, g_port, fixture)

  it('liquidates the only vault on Feb-16-2021 (block: 6228926)', async function () {
    await fork(6228926, 'arb-mainnet')
    const [_owner, liquidator] = await deploy_flash_liquidator()

    const starting_balance = await _owner.getBalance()

    const vault_created_at_block = 6202673
    const vauld_id = '300eac7ff309b16b6b62d028'

    // the vault is not underwater and the bot won't liquidate it
    // to force the liquidation, we raise the minimum collateralization ratio from 140% to 280%
    // we need to overwrite Cauldron's storage: mapping (bytes6 => mapping(bytes6 => DataTypes.SpotOracle)) public spotOracles;
    // Use this Solidity code to compute the storage address:
    //
    // bytes6 base_id = hex"303200000000";
    // bytes6 ilk_id = hex"303000000000";
    // uint256 slot = 8; (3 slots from Constants; 1 slot from AccessControl; 5th slot in Cauldron)
    // bytes32 key = keccak256(abi.encodePacked(bytes32(ilk_id),
    //     keccak256(abi.encodePacked(bytes32(base_id),  slot))));
    // bytes memory x = abi.encodePacked(uint256(key));
    // (details: https://docs.soliditylang.org/en/v0.8.12/internals/layout_in_storage.html#mappings-and-dynamic-arrays)
    //
    // original value stored:
    // ❯❯❯ seth storage --rpc-url=https://arb-mainnet.g.alchemy.com/v2/U-UL75gKAlSVqycCC_vkCvw03r3QwKEd $CAULDRON 0x84e340865ca631ed48733f6aa28877cc399b6b6122b4d50a3045b126446d1e93
    // 0x000000000000000000155cc030e042468e333fde8e52dd237673d7412045d2ac
    //
    // Last 20 bytes is DataTypes.SpotOracle.oracle; 4 bytes before that (155cc0) is the ratio that we want to change

    await network.provider.send('hardhat_setStorageAt', [
      '0x23cc87FBEBDD67ccE167Fa9Ec6Ad3b7fE3892E30', // cauldron
      '0x84e340865ca631ed48733f6aa28877cc399b6b6122b4d50a3045b126446d1e93', // storage slot
      '0x0000000000000000002ab98030e042468e333fde8e52dd237673d7412045d2ac', // original value with new ratio
    ])

    // Since we're running on a hardhat fork, we don't have access to Arbitrum precompiles
    // Multicall2 contract (https://arbiscan.io/address/0x842eC2c7D803033Edf55E478F461FC547Bc54EB2) needs
    // them, so we deploy our mock at the precompile address
    // Details why Multical2 uses the precompile: https://developer.offchainlabs.com/docs/time_in_arbitrum
    //
    const arbSysMockFactory = (await ethers.getContractFactory('ArbSysMock')) as ArbSysMock__factory
    const arbSysMock = (await arbSysMockFactory.deploy()) as ArbSysMock
    const arbSysCode = await ethers.provider.getCode(arbSysMock.address)

    expect(await network.provider.send('hardhat_setCode', ['0x0000000000000000000000000000000000000064', arbSysCode]))
      .to.be.true

    logger.info('Triggering auction')
    // do the 1st run: trigger the auction
    await run_liquidator(fixture, liquidator, {})

    // wait a few hours for auction to release all collateral
    await network.provider.send('evm_increaseTime', [7200])
    await network.provider.send('evm_mine')

    logger.info('Liquidating vaults')
    // 2nd run: liquidate the vault
    const liquidator_logs = await run_liquidator(fixture, liquidator, {})

    let bought = 0

    for (const log_record of liquidator_logs) {
      if (log_record['level'] == 'INFO' && log_record['fields']['message'] == 'Submitted buy order') {
        bought++
      }
      expect(log_record['level']).to.not.equal('ERROR') // no errors allowed
    }
    expect(bought).to.be.equal(1)

    const final_balance = await _owner.getBalance()
    logger.warn('ETH used: ', starting_balance.sub(final_balance).div(1e12).toString(), 'uETH')
  })
})

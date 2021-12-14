import { ethers, network } from 'hardhat'

import * as fs from 'fs'
import { BigNumber } from 'ethers'
import { jsonToMap, stringToBytes6, bytesToBytes32, impersonate, getOriginalChainId } from '../../../../shared/helpers'
import { ERC20Mock, Cauldron, FlashLiquidator, Ladle, FYToken, Witch, CompositeMultiOracle } from '../../../../typechain'

import { YVUSDC, WAD } from '../../../../shared/constants'

/**
 * @dev This script tests YVUSDC as a collateral
 */
;(async () => {
  const chainId = await getOriginalChainId()
  if (!(chainId === 1 || chainId === 4 || chainId === 42)) throw 'Only Kovan, Rinkeby and Mainnet supported'
  const path = chainId === 1 ? './addresses/mainnet/' : './addresses/kovan/'

  const seriesIds: Array<string> = [
    stringToBytes6('0104'),
    stringToBytes6('0105'),
    stringToBytes6('0204'),
    stringToBytes6('0205'),
  ]

  // Impersonate YVUSDC whale 0xd7a029db2585553978190db5e85ec724aa4df23f
  const yvUSDCWhale = '0xd7a029db2585553978190db5e85ec724aa4df23f'
  const yvUSDCWhaleAcc = await impersonate(yvUSDCWhale, WAD)

  const yvUSDCAddress = new Map([
    [1, '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72'],
    [42, '0xA24b97c7617cc40dCc122F6dF813584A604a6C28'],
  ]) // https://yvUSDC.mirror.xyz/5cGl-Y37aTxtokdWk21qlULmE1aSM_NuX9fstbOPoWU

  const protocol = jsonToMap(fs.readFileSync(path + 'protocol.json', 'utf8')) as Map<string, string>
  const governance = jsonToMap(fs.readFileSync(path + 'governance.json', 'utf8')) as Map<string, string>

  // TODO: Shouldn't this be a yvToken mock?
  const yvUSDC = (await ethers.getContractAt(
    'ERC20Mock',
    yvUSDCAddress.get(chainId) as string,
    yvUSDCWhaleAcc
  )) as unknown as ERC20Mock
  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    yvUSDCWhaleAcc
  )) as unknown as Cauldron
  const ladle = (await ethers.getContractAt(
    'Ladle',
    protocol.get('ladle') as string,
    yvUSDCWhaleAcc
  )) as unknown as Ladle
  const oracle = (await ethers.getContractAt(
    'CompositeMultiOracle',
    protocol.get('compositeOracle') as string,
    yvUSDCWhaleAcc
  )) as unknown as CompositeMultiOracle
  const witch = (await ethers.getContractAt('Witch', protocol.get('witch') as string, yvUSDCWhaleAcc)) as unknown as Witch
  const flashLiquidator = (await ethers.getContractAt(
    'FlashLiquidator',
    protocol.get('flashLiquidator') as string,
    yvUSDCWhaleAcc
  )) as unknown as FlashLiquidator

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    yvUSDCWhaleAcc
  )) as unknown as FlashLiquidator

  if (chainId !== 1) {
    // Use the mock YVUSDC to mint
    await yvUSDC.mint(yvUSDCWhale, WAD.mul(1000000)) // This should be enough
  }
  const yvUSDCBalanceBefore = await yvUSDC.balanceOf(yvUSDCWhaleAcc.address)
  console.log(`${yvUSDCBalanceBefore} YVUSDC available`)

  for (let seriesId of seriesIds) {
    console.log(`series: ${seriesId}`)
    const series = await cauldron.series(seriesId)
    const fyToken = (await ethers.getContractAt('FYToken', series.fyToken, yvUSDCWhaleAcc)) as unknown as FYToken

    const dust = (await cauldron.debt(series.baseId, YVUSDC)).min
    const ratio = (await cauldron.spotOracles(series.baseId, YVUSDC)).ratio
    const borrowed = BigNumber.from(10)
      .pow(await fyToken.decimals())
      .mul(dust)
    const posted = (await oracle.peek(bytesToBytes32(series.baseId), bytesToBytes32(YVUSDC), borrowed))[0]
      .mul(ratio)
      .div(1000000)
      .mul(101)
      .div(100) // borrowed * spot * ratio * 1.01 (for margin)

    // Build vault
    await ladle.build(seriesId, YVUSDC, 0)
    const logs = await cauldron.queryFilter(cauldron.filters.VaultBuilt(null, null, null, null))
    const vaultId = logs[logs.length - 1].args.vaultId
    console.log(`vault: ${vaultId}`)

    // Post YVUSDC and borrow fyDAI
    const linkJoinAddress = await ladle.joins(YVUSDC)
    await yvUSDC.transfer(linkJoinAddress, posted)
    await ladle.pour(vaultId, yvUSDCWhaleAcc.address, posted, borrowed)
    console.log(`posted and borrowed`)

    if ((await cauldron.balances(vaultId)).art.toString() !== borrowed.toString()) throw 'art mismatch'
    if ((await cauldron.balances(vaultId)).ink.toString() !== posted.toString()) throw 'ink mismatch'

    // Repay fyDai and withdraw yvUSDC
    await fyToken.transfer(fyToken.address, borrowed)
    await ladle.pour(vaultId, yvUSDCWhaleAcc.address, posted.mul(-1), borrowed.mul(-1))
    console.log(`repaid and withdrawn`)
    if ((await yvUSDC.balanceOf(yvUSDCWhaleAcc.address)).toString() !== yvUSDCBalanceBefore.toString())
      throw 'balance mismatch'

    // begin flash liq test code
    // *********************************************
    // *********************************************
    // *********************************************
    const flashLiquidatorAddress = '0xfbC22278A96299D91d41C453234d97b4F5Eb9B2d'

    const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
    const cauldronAddress = '0xc88191F8cb8e6D4a668B047c1C8503432c3Ca867'
    const witchAddress = '0x53C3760670f6091E1eC76B4dd27f73ba4CAd5061'
    const timelockAddress = '0x3b870db67a45611CF4723d44487EAF398fAc51E3'
    const recipient = '0x3b43618b2961D5fbDf269A72ACcb225Df70dCb48'

    const ETH = ethers.utils.formatBytes32String('00').slice(0, 14)
    const WSTETH = ethers.utils.formatBytes32String('04').slice(0, 14)
    const STETH = ethers.utils.formatBytes32String('05').slice(0, 14)

    let [ownerAcc] = await ethers.getSigners()

    // Give some ether to the running account, since we are in a mainnet fork and would have nothing
    await network.provider.send('hardhat_setBalance', [ownerAcc.address, ethers.utils.parseEther('10').toHexString()])

    // Give some ether to the timelock, we'll need it later
    await network.provider.send('hardhat_setBalance', [protocol.get('timelock') as string, ethers.utils.parseEther('10').toHexString()])

    // Contract instantiation
    const WETH = (await ethers.getContractAt('IWETH9', wethAddress, ownerAcc)) as unknown as IERC20
    // const cauldron = (await ethers.getContractAt('Cauldron', cauldronAddress, ownerAcc)) as unknown as Cauldron

    // At the time of writing, this vault is collateralized at 268%. Find more at https://yield-protocol-info.netlify.app/#/vaults
    console.log(`Vault to liquidate: ${vaultId}`)

    // Check collateralToDebtRatio, just to make sure it doesn't revert
    console.log(`Collateral to debt ratio: ${await flashLiquidator.callStatic.collateralToDebtRatio(vaultId)}`)

    // Raise the required collateralization to 300%
    await network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [timelockAddress],
    })
    const timelockAcc = await ethers.getSigner(timelockAddress)

    const oracleAddress = (await cauldron.spotOracles(ETH, WSTETH)).oracle
    console.log(`Raising required collateralization to 3000%`)
    await cauldron.connect(timelockAcc).setSpotOracle(ETH, WSTETH, oracleAddress, 30000000)

    // Liquidate the vault
    console.log(`Auctioning ${vaultId}`)
    await witch.auction(vaultId)

    // Check if it is at minimal price (should be false)
    console.log(`Is at minimal price: ${await flashLiquidator.callStatic.isAtMinimalPrice(vaultId)}`)

    // Wait to get enough collateral to pay the flash loan plus the fees
    const { timestamp } = await ethers.provider.getBlock('latest')
    await ethers.provider.send('evm_mine', [timestamp + 3600])

    // Check if it is at minimal price (should be true)
    console.log(`Is at minimal price: ${await flashLiquidator.callStatic.isAtMinimalPrice(vaultId)}`)

    console.log(`Liquidating ${vaultId}`)
    await flashLiquidator.liquidate(vaultId)

    console.log(`Profit: ${await WETH.balanceOf(recipient)}`)
  }
})()

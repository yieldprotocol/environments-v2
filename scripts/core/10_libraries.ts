import { ethers } from 'hardhat'
import * as hre from 'hardhat'
import * as fs from 'fs'
import { mapToJson, jsonToMap, verify, readAddressMappingIfExists, writeAddressMap, getAddressMappingFilePath } from '../../shared/helpers'

import { YieldMath } from '../../typechain/YieldMath'
import { YieldMathExtensions } from '../../typechain/YieldMathExtensions'
import { PoolView } from '../../typechain/PoolView'
import { SafeERC20Namer } from '../../typechain/SafeERC20Namer'

/**
 * @dev This script deploys the SafeERC20Namer and YieldMath libraries
 */

;(async () => {
  /* await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: ["0xA072f81Fea73Ca932aB2B5Eda31Fa29306D58708"],
  });
  const ownerAcc = await ethers.getSigner("0xA072f81Fea73Ca932aB2B5Eda31Fa29306D58708") */
  const [ownerAcc] = await ethers.getSigners()


  const protocol = readAddressMappingIfExists('protocol.json');

  let yieldMath: YieldMath
  if (protocol.get('yieldMath') === undefined) {
    const YieldMathFactory = await ethers.getContractFactory('YieldMath')
    yieldMath = (await YieldMathFactory.deploy()) as unknown as YieldMath
    await yieldMath.deployed()
    console.log(`[YieldMath, '${yieldMath.address}'],`)
    verify(yieldMath.address, [])
    protocol.set('yieldMath', yieldMath.address)
    writeAddressMap("protocol.json", protocol);
    fs.writeFileSync(getAddressMappingFilePath('yieldMath.js'), `module.exports = { YieldMath: "${yieldMath.address}" }`, 'utf8')
  } else {
    yieldMath = (await ethers.getContractAt('YieldMath', protocol.get('yieldMath') as string, ownerAcc)) as YieldMath
  }

  let yieldMathExtensions: YieldMathExtensions
  if (protocol.get('yieldMathExtensions') === undefined) {
    const YieldMathExtensionsFactory = await ethers.getContractFactory('YieldMathExtensions', {
      libraries: {
        YieldMath: yieldMath.address,
      },
    })
    yieldMathExtensions = (await YieldMathExtensionsFactory.deploy()) as unknown as YieldMathExtensions
    await yieldMathExtensions.deployed()
    console.log(`[yieldMathExtensions, '${yieldMathExtensions.address}'],`)
    verify(yieldMathExtensions.address, [], getAddressMappingFilePath('yieldMath.js'))
    protocol.set('yieldMathExtensions', yieldMathExtensions.address)
    writeAddressMap("protocol.json", protocol);
    fs.writeFileSync(
      getAddressMappingFilePath('yieldMathExtensions.js'),
      `module.exports = { YieldMathExtensions: "${yieldMathExtensions.address}" }`,
      'utf8'
    )
  } else {
    yieldMathExtensions = (await ethers.getContractAt(
      'YieldMathExtensions',
      protocol.get('yieldMathExtensions') as string,
      ownerAcc
    )) as YieldMathExtensions
  }

  let poolView: PoolView
  if (protocol.get('poolView') === undefined) {
    const PoolViewFactory = await ethers.getContractFactory('PoolView', {
      libraries: {
        YieldMathExtensions: yieldMathExtensions.address,
      },
    })
    poolView = (await PoolViewFactory.deploy()) as unknown as PoolView
    await poolView.deployed()
    console.log(`[poolView, '${poolView.address}'],`)
    verify(poolView.address, [], getAddressMappingFilePath('yieldMathExtensions.js'))
    protocol.set('poolView', poolView.address)
    writeAddressMap("protocol.json", protocol);
  } else {
    poolView = (await ethers.getContractAt('PoolView', protocol.get('poolView') as string, ownerAcc)) as PoolView
  }

  let safeERC20Namer: SafeERC20Namer
  if (protocol.get('safeERC20Namer') === undefined) {
    const SafeERC20NamerFactory = await ethers.getContractFactory('SafeERC20Namer')
    safeERC20Namer = (await SafeERC20NamerFactory.deploy()) as unknown as SafeERC20Namer
    await safeERC20Namer.deployed()
    console.log(`[SafeERC20Namer, '${safeERC20Namer.address}'],`)
    verify(safeERC20Namer.address, [])
    protocol.set('safeERC20Namer', safeERC20Namer.address)
    writeAddressMap("protocol.json", protocol);
    fs.writeFileSync(getAddressMappingFilePath('safeERC20Namer.js'), `module.exports = { SafeERC20Namer: "${safeERC20Namer.address}" }`, 'utf8')
  } else {
    safeERC20Namer = (await ethers.getContractAt(
      'SafeERC20Namer',
      protocol.get('safeERC20Namer') as string,
      ownerAcc
    )) as SafeERC20Namer
  }
})()

import { ethers, waffle } from 'hardhat'
import {
  getOwnerOrImpersonate,
  readAddressMappingIfExists,
  proposeApproveExecute,
  writeAddressMap,
  verify,
} from '../../../../../shared/helpers'

import { FDAI2209, FDAI2209ID, FUSDC2209, FUSDC2209ID, FDAI2212, FUSDC2212 } from '../../../../../shared/constants'

import { Timelock, NotionalJoinFactory, NotionalJoin } from '../../../../../typechain'
import { orchestrateNotionalJoinProposal } from '../../../../fragments/utils/orchestrateNotionalJoinProposal'
const { developer, deployer } = require(process.env.CONF as string)
const notionalAssetAddress = '0x1344A36A1B56144C3Bc62E7757377D288fDE0369'
const salt = ethers.BigNumber.from('1')

import NotionalJoinArtifact from '../../../../../artifacts/@yield-protocol/vault-v2/contracts/other/notional/NotionalJoin.sol/NotionalJoin.json'
const { deployContract } = waffle

/**
 * @dev This script deploys Notional Joins via Notional Join Factory
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(deployer)

  const protocol = readAddressMappingIfExists('protocol.json')
  const governance = readAddressMappingIfExists('governance.json')
  const joins = readAddressMappingIfExists('joins.json')

  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc)
  console.log(`timelock: ${timelock.address}`)

  const cloak = await ethers.getContractAt('Timelock', governance.get('cloak') as string, ownerAcc)
  console.log(`cloak: ${cloak.address}`)

  const notionalJoinFactory = await ethers.getContractAt(
    'NotionalJoinFactory',
    protocol.get('notionalJoinFactory') as string,
    ownerAcc
  )
  console.log(`notionalJoinFactory: ${notionalJoinFactory.address}`)

  // set activate accordingly
  const activateProposal: boolean = false
  const activateDeployJoinsFactory: boolean = false
  const activateDeployJoinsDirectly: boolean = true

  let proposal: Array<{ target: string; data: string }> = []

  if (activateProposal) {
    // Permissions
    proposal = proposal.concat(await orchestrateNotionalJoinProposal(ownerAcc, deployer, timelock))

    // Propose, Approve & execute
    if (proposal.length > 0) {
      await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string, developer)
    } else {
      console.log(`proposal skipped`)
    }
  }

  if (activateDeployJoinsFactory) {
    // add FDAI2209
    await notionalJoinFactory.addFCash(FDAI2209, FDAI2209ID)
    console.log(`FDAI2209 added as reference`)

    // add FUSDC2209
    await notionalJoinFactory.addFCash(FUSDC2209, FUSDC2209ID)
    console.log(`FUSDC2209 added as reference`)

    // deploy FDAI2212 | args = oldAssetId, newAssetId, newAssetAddress, salt
    console.log(FDAI2209) //bytes6
    console.log(FDAI2212) //bytes6
    console.log(notionalAssetAddress) //address
    console.log(salt) //uint256

    const txDAI = (await notionalJoinFactory.deploy(FDAI2209, FDAI2212, notionalAssetAddress, salt, {
      gasLimit: 10000000,
    })) as any

    joins.set(FDAI2212, txDAI.to)
    writeAddressMap('joins.json', joins)
    console.log(`FDAI2212 Join deployed at: ${txDAI.to}`)

    // deploy FUSDC2212 | args = oldAssetId, newAssetId, newAssetAddress, salt
    const txUSDC = (await notionalJoinFactory.deploy(FUSDC2209, FUSDC2212, notionalAssetAddress, salt, {
      gasLimit: 10000000,
    })) as any

    joins.set(FUSDC2212, txUSDC.to)
    writeAddressMap('joins.json', joins)
    console.log(`FUSDC2212 Join deployed at: ${txUSDC.to}`)
  } else {
    console.log(`Notional Joins NOT deployed using Factory`)
  }

  if (activateDeployJoinsDirectly) {
    console.log(`Deploying Njoins directly w/o Factory`)

    // address asset_, address underlying_, address underlyingJoin_, uint40 maturity_, uint16 currencyId_
    const daiAddress = '0x6b175474e89094c44da98b954eedeac495271d0f'
    const daiJoin = '0x4fE92119CDf873Cf8826F4E6EcfD4E578E3D44Dc'
    const daiCurrencyId = 2

    const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
    const usdcJoin = '0x0d9A1A773be5a83eEbda23bf98efB8585C3ae4f4'
    const usdcCurrencyId = 3

    const maturity = 1664064000 + 86400 * 90 // sept maturity rolled forward

    let daiArgs = [notionalAssetAddress, daiAddress, daiJoin, maturity, daiCurrencyId]
    let usdcArgs = [notionalAssetAddress, usdcAddress, usdcJoin, maturity, usdcCurrencyId]

    const daiNjoin = await deployContract(ownerAcc, NotionalJoinArtifact, daiArgs)
    console.log(`Dai NJoin deployed at ${daiNjoin.address}`)

    verify(daiNjoin.address, daiArgs)
    joins.set(FDAI2212, daiNjoin.address)
    writeAddressMap('joins.json', joins)

    const usdcNjoin = await deployContract(ownerAcc, NotionalJoinArtifact, usdcArgs)
    console.log(`USDC NJoin deployed at ${usdcNjoin.address}`)

    verify(usdcNjoin.address, daiArgs)
    joins.set(FUSDC2212, usdcNjoin.address)
    writeAddressMap('joins.json', joins)

    console.log(`All notional joins deployed w/o factory`)

    // resolve AccessControl due to manual deployment

    const dai1 = await daiNjoin.grantRole('0x00000000', cloak.address, { gasLimit: 10_000_000 })
    const dai2 = await daiNjoin.grantRole('0x00000000', timelock.address, { gasLimit: 10_000_000 })
    const dai3 = await daiNjoin.renounceRole('0x00000000', deployer, { gasLimit: 10_000_000 })

    const usdc1 = await usdcNjoin.grantRole('0x00000000', cloak.address, { gasLimit: 10_000_000 })
    const usdc2 = await usdcNjoin.grantRole('0x00000000', timelock.address, { gasLimit: 10_000_000 })
    const usdc3 = await usdcNjoin.renounceRole('0x00000000', deployer, { gasLimit: 10_000_000 })

    console.log(`Resolved AccessControl due to manual deployment`)
  }

  console.log(`completed`)
})()

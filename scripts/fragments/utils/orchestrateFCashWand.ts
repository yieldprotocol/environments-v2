import { ethers } from 'hardhat'
import { id } from '@yield-protocol/utils-v2'
import { ROOT } from '../../../shared/constants'
import { readAddressMappingIfExists } from '../../../shared/helpers'

import { Cauldron, NotionalMultiOracle, EmergencyBrake, Ladle, Timelock, OldWitch } from '../../../typechain'
import { developer } from '../../governance/base.arb_mainnet.config'

const { protocol, governance } = require(process.env.CONF as string)
const joins = readAddressMappingIfExists('joins.json')
import { FDAI2212, FUSDC2212 } from '../../../shared/constants'

export const orchestrateFCashWand = async (
  ownerAcc: any,
  deployer: string,
  timelock: Timelock,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log(`\n${'  '.repeat(nesting)}ORCHESTRATE_F_CASH_WAND`)
  let proposal: Array<{ target: string; data: string }> = []

  const fCashWand = await ethers.getContractAt('FCashWand', protocol.get('fCashWand') as string, ownerAcc)
  console.log(`${'  '.repeat(nesting)}fCashWand: ${fCashWand.address}`)

  const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc)
  console.log(`${'  '.repeat(nesting)}cauldron: ${cauldron.address}`)

  const ladle = await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)
  console.log(`${'  '.repeat(nesting)}ladle: ${ladle.address}`)

  const notionalOracle = await ethers.getContractAt(
    'NotionalMultiOracle',
    protocol.get('notionalOracle') as string,
    ownerAcc
  )
  console.log(`${'  '.repeat(nesting)}notionalOracle: ${notionalOracle.address}`)

  const cloak = await ethers.getContractAt('EmergencyBrake', governance.get('cloak') as string, ownerAcc)
  console.log(`${'  '.repeat(nesting)}cloak: ${cloak.address}`)

  const witch = await ethers.getContractAt('OldWitch', protocol.get('witch') as string, ownerAcc)
  console.log(`${'  '.repeat(nesting)}witch: ${witch.address}`)

  const notionalJoinFactory = await ethers.getContractAt(
    'NotionalJoinFactory',
    protocol.get('notionalJoinFactory') as string,
    ownerAcc
  )
  console.log(`${'  '.repeat(nesting)}notionalJoinFactory: ${notionalJoinFactory.address}`)

  // grab new Joins
  const daiNewJoin = await ethers.getContractAt('NotionalJoin', joins.get(FDAI2212) as string, ownerAcc)
  console.log(`${'  '.repeat(nesting)}daiNewJoin: ${daiNewJoin.address}`)

  const usdcNewJoin = await ethers.getContractAt('NotionalJoin', joins.get(FUSDC2212) as string, ownerAcc)
  console.log(`${'  '.repeat(nesting)}usdcNewJoin: ${usdcNewJoin.address}`)

  // revoke ROOT on fCashWand
  proposal.push({
    target: fCashWand.address,
    data: fCashWand.interface.encodeFunctionData('revokeRole', [ROOT, deployer]),
  })

  // allow deployer to call deployAddfCashCollateral()
  proposal.push({
    target: fCashWand.address,
    data: fCashWand.interface.encodeFunctionData('grantRole', [
      id(fCashWand.interface, 'deployAddfCashCollateral(bytes6,bytes6,bytes6,address,uint256)'),
      developer,
    ]),
  })

  // allow fCashWand to call deploy() on notionalJoinFactory
  proposal.push({
    target: notionalJoinFactory.address,
    data: notionalJoinFactory.interface.encodeFunctionData('grantRole', [
      id(notionalJoinFactory.interface, 'deploy(bytes6,bytes6,address,uint256)'),
      fCashWand.address,
    ]),
  })

  // allow deployer to call addfCashCollateral()
  proposal.push({
    target: fCashWand.address,
    data: fCashWand.interface.encodeFunctionData('grantRole', [
      id(fCashWand.interface, 'addfCashCollateral(bytes6,address,bytes6,bytes6)'),
      developer,
    ]),
  })

  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('grantRoles', [
      [
        id(cauldron.interface, 'addAsset(bytes6,address)'),
        id(cauldron.interface, 'addIlks(bytes6,bytes6[])'),
        id(cauldron.interface, 'setSpotOracle(bytes6,bytes6,address,uint32)'),
        id(cauldron.interface, 'setDebtLimits(bytes6,bytes6,uint96,uint24,uint8)'),
      ],
      fCashWand.address,
    ]),
  })

  proposal.push({
    target: ladle.address,
    data: ladle.interface.encodeFunctionData('grantRole', [
      id(ladle.interface, 'addJoin(bytes6,address)'),
      fCashWand.address,
    ]),
  })

  proposal.push({
    target: notionalOracle.address,
    data: notionalOracle.interface.encodeFunctionData('grantRole', [
      id(notionalOracle.interface, 'setSource(bytes6,bytes6,address)'),
      fCashWand.address,
    ]),
  })

  proposal.push({
    target: cloak.address,
    data: cloak.interface.encodeFunctionData('grantRole', [
      id(cloak.interface, 'plan(address,(address,bytes4[])[])'),
      fCashWand.address,
    ]),
  })

  proposal.push({
    target: cloak.address,
    data: cloak.interface.encodeFunctionData('grantRole', ['0x00000000', fCashWand.address]),
  })

  proposal.push({
    target: witch.address,
    data: witch.interface.encodeFunctionData('grantRoles', [
      [
        id(witch.interface, 'point(bytes32,address)'),
        id(witch.interface, 'setIlk(bytes6,uint32,uint64,uint96,uint24,uint8)'),
      ],
      fCashWand.address,
    ]),
  })

  // for _makeIlk: join.grantRole(EXIT, address(witch) | grant admin to clear modifier
  proposal.push({
    target: daiNewJoin.address,
    data: daiNewJoin.interface.encodeFunctionData('grantRole', [ROOT, fCashWand.address]),
  })

  proposal.push({
    target: usdcNewJoin.address,
    data: usdcNewJoin.interface.encodeFunctionData('grantRole', [ROOT, fCashWand.address]),
  })

  return proposal
}

import { ethers } from 'hardhat'
import { id } from '@yield-protocol/utils-v2'
import { ROOT } from '../../../shared/constants'
import { bytesToString } from '../../../shared/helpers'

import { Cauldron, NotionalMultiOracle, EmergencyBrake, Ladle, Timelock, OldWitch } from '../../../typechain'
import { FCashWand } from '../../../typechain'

const { protocol, governance } = require(process.env.CONF as string)
export const orchestrateFCashWandProposal = async (
  ownerAcc: any,
  deployer: string,
  timelock: Timelock
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []

  const fCashWand = (await ethers.getContractAt(
    'FCashWand',
    protocol.get('fCashWand') as string,
    ownerAcc
  )) as FCashWand

  const cauldron = (await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc)) as Cauldron

  const ladle = (await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as Ladle

  const notionalOracle = (await ethers.getContractAt(
    'NotionalMultiOracle',
    protocol.get('notionalOracle') as string,
    ownerAcc
  )) as NotionalMultiOracle

  const cloak = (await ethers.getContractAt(
    'EmergencyBrake',
    governance.get('cloak') as string,
    ownerAcc
  )) as unknown as EmergencyBrake

  const witch = (await ethers.getContractAt(
    'OldWitch',
    protocol.get('witch') as string,
    ownerAcc
  )) as unknown as OldWitch

  console.log(`fCashWand: ${fCashWand.address}`)
  console.log(`cauldron: ${cauldron.address}`)
  console.log(`ladle: ${ladle.address}`)
  console.log(`notionalOracle: ${notionalOracle.address}`)
  console.log(`cloak: ${cloak.address}`)
  console.log(`witch: ${witch.address}`)

  proposal.push({
    target: fCashWand.address,
    data: fCashWand.interface.encodeFunctionData('grantRole', [
      id(fCashWand.interface, 'addfCashCollateral(bytes6,address,bytes6,bytes6)'),
      timelock.address,
    ]),
  })

  proposal.push({
    target: fCashWand.address,
    data: fCashWand.interface.encodeFunctionData('revokeRole', [ROOT, deployer]),
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

  return proposal
}

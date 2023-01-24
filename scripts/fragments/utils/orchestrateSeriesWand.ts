import { ethers } from 'hardhat'
import { id } from '@yield-protocol/utils-v2'
import { ROOT } from '../../../shared/constants'
import { Cauldron, EmergencyBrake, Ladle, Timelock } from '../../../typechain'
import { SeriesWand } from '../../../typechain'
import { indent } from '../../../shared/helpers'

const { protocol, governance } = require(process.env.CONF as string)
export const orchestrateSeriesWand = async (
  ownerAcc: any,
  deployer: string,
  timelock: Timelock,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []

  const seriesWand = (await ethers.getContractAt(
    'SeriesWand',
    protocol.get('seriesWand') as string,
    ownerAcc
  )) as SeriesWand

  const cauldron = (await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc)) as Cauldron

  const ladle = (await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as Ladle

  const cloak = (await ethers.getContractAt(
    'EmergencyBrake',
    governance.get('cloak') as string,
    ownerAcc
  )) as unknown as EmergencyBrake

  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('grantRoles', [
      [id(cauldron.interface, 'addSeries(bytes6,bytes6,address)'), id(cauldron.interface, 'addIlks(bytes6,bytes6[])')],
      seriesWand.address,
    ]),
  })

  proposal.push({
    target: seriesWand.address,
    data: seriesWand.interface.encodeFunctionData('grantRole', [
      id(seriesWand.interface, 'addSeries(bytes6,bytes6,bytes6[],address,address)'),
      timelock.address,
    ]),
  })

  proposal.push({
    target: ladle.address,
    data: ladle.interface.encodeFunctionData('grantRole', [
      id(ladle.interface, 'addPool(bytes6,address'),
      seriesWand.address,
    ]),
  })

  proposal.push({
    target: cloak.address,
    data: cloak.interface.encodeFunctionData('grantRole', [
      id(cloak.interface, 'plan(address,(address,bytes4[])[])'),
      seriesWand.address,
    ]),
  })

  proposal.push({
    target: cloak.address,
    data: cloak.interface.encodeFunctionData('grantRole', ['0x00000000', seriesWand.address]),
  })

  proposal.push({
    target: seriesWand.address,
    data: seriesWand.interface.encodeFunctionData('revokeRole', [ROOT, deployer]),
  })

  return proposal
}

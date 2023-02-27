import { ethers } from 'hardhat'

import { ROOT } from '../../../shared/constants'
import { Cauldron, ChainlinkMultiOracle, EmergencyBrake, Join, Ladle, Timelock, Witch } from '../../../typechain'
import { CollateralWand } from '../../../typechain'
import { indent, id } from '../../../shared/helpers'

const { protocol, governance } = require(process.env.CONF as string)
export const orchestrateCollateralWand = async (
  ownerAcc: any,
  deployer: string,
  timelock: Timelock,
  join: Join,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ORCHESTRATE_COLLATERAL_WAND`))
  let proposal: Array<{ target: string; data: string }> = []

  const collateralWand = (await ethers.getContractAt(
    'CollateralWand',
    protocol.get('collateralWand') as string,
    ownerAcc
  )) as CollateralWand

  const cauldron = (await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc)) as Cauldron

  const ladle = (await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as Ladle

  const spotOracle = (await ethers.getContractAt(
    'ChainlinkMultiOracle',
    protocol.get('chainlinkMultiOracle') as string,
    ownerAcc
  )) as ChainlinkMultiOracle

  const cloak = (await ethers.getContractAt(
    'EmergencyBrake',
    governance.get('cloak') as string,
    ownerAcc
  )) as unknown as EmergencyBrake

  const witch = (await ethers.getContractAt('Witch', protocol.get('witch') as string, ownerAcc)) as unknown as Witch

  proposal.push({
    target: collateralWand.address,
    data: collateralWand.interface.encodeFunctionData('grantRole', [
      id(
        collateralWand.interface,
        'addChainlinkCollateral(bytes6,address,address,address,(bytes6,address,bytes6,address,address)[],(bytes6,uint32,uint64,uint96,uint24,uint8)[],(bytes6,bytes6,uint32,uint96,uint24,uint8)[],(bytes6,bytes6[])[])'
      ),
      timelock.address,
    ]),
  })

  proposal.push({
    target: collateralWand.address,
    data: collateralWand.interface.encodeFunctionData('revokeRole', [ROOT, deployer]),
  })

  // proposal.push({
  //   target: join.address,
  //   data: join.interface.encodeFunctionData('grantRole', [
  //     id(join.interface, 'grantRoles(bytes4[],address)'),
  //     collateralWand.address,
  //   ]),
  // })

  // proposal.push({
  //   target: join.address,
  //   data: join.interface.encodeFunctionData('grantRole', ['0x00000000', collateralWand.address]),
  // })

  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('grantRoles', [
      [
        id(cauldron.interface, 'addAsset(bytes6,address)'),
        id(cauldron.interface, 'addIlks(bytes6,bytes6[])'),
        id(cauldron.interface, 'setSpotOracle(bytes6,bytes6,address,uint32)'),
        id(cauldron.interface, 'setDebtLimits(bytes6,bytes6,uint96,uint24,uint8)'),
      ],
      collateralWand.address,
    ]),
  })

  proposal.push({
    target: ladle.address,
    data: ladle.interface.encodeFunctionData('grantRole', [
      id(ladle.interface, 'addJoin(bytes6,address'),
      collateralWand.address,
    ]),
  })

  proposal.push({
    target: spotOracle.address,
    data: spotOracle.interface.encodeFunctionData('grantRole', [
      id(spotOracle.interface, 'setSource(bytes6,address,bytes6,address,address)'),
      collateralWand.address,
    ]),
  })

  proposal.push({
    target: cloak.address,
    data: cloak.interface.encodeFunctionData('grantRole', [
      id(cloak.interface, 'plan(address,(address,bytes4[])[])'),
      collateralWand.address,
    ]),
  })

  proposal.push({
    target: cloak.address,
    data: cloak.interface.encodeFunctionData('grantRole', ['0x00000000', collateralWand.address]),
  })

  proposal.push({
    target: witch.address,
    data: witch.interface.encodeFunctionData('grantRoles', [
      [
        id(witch.interface, 'point(bytes32,address)'),
        id(witch.interface, 'setIlk(bytes6,uint32,uint64,uint96,uint24,uint8)'),
      ],
      collateralWand.address,
    ]),
  })

  return proposal
}

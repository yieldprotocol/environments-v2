import { id } from '@yield-protocol/utils-v2'
import { ROOT } from '../../../shared/constants'
import { Timelock, EmergencyBrake, Cauldron, Ladle, Witch, Wand, JoinFactory, FYTokenFactory, PoolFactory } from '../../../typechain'

/**
 * @dev This script orchestrates the Wand
 * The Cloak gets ROOT access. Root access is removed from the deployer.
 * The Timelock gets access to governance functions.
 * The Wand gets access to permissioned functions in Cauldron, Ladle and Factories
 * Emergency plans are registered
 */

 export const orchestrateWandProposal = async (
  deployer: string,
  cauldron: Cauldron,
  ladle: Ladle,
  wand: Wand,
  joinFactory: JoinFactory,
  fyTokenFactory: FYTokenFactory,
  poolFactory: PoolFactory,
  timelock: Timelock,
  cloak: EmergencyBrake
): Promise<Array<{ target: string; data: string }>>  => {
  // Give access to each of the governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, revoke ROOT from the deployer
  // Orchestrate Wand to use the permissioned functions in Cauldron, Ladle and Factories
  // Store a plan for isolating the Wand from the above
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: wand.address,
    data: wand.interface.encodeFunctionData('grantRoles', [
      [
        id(wand.interface, 'addAsset(bytes6,address)'),
        id(wand.interface, 'makeBase(bytes6,address)'),
        id(wand.interface, 'makeIlk(bytes6,bytes6,address,uint32,uint96,uint24,uint8)'),
        id(wand.interface, 'addSeries(bytes6,bytes6,uint32,bytes6[],string,string)'),
        id(wand.interface, 'point(bytes32,address)'),
      ],
      timelock.address,
    ]),
  })
  console.log(`wand.grantRoles(gov, timelock)`)

  proposal.push({
    target: wand.address,
    data: wand.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
  })
  console.log(`wand.grantRole(ROOT, cloak)`)

  proposal.push({
    target: wand.address,
    data: wand.interface.encodeFunctionData('revokeRole', [ROOT, deployer]),
  })
  console.log(`wand.revokeRole(ROOT, deployer)`)

  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('grantRoles', [
      [
        id(cauldron.interface, 'addAsset(bytes6,address)'),
        id(cauldron.interface, 'addSeries(bytes6,bytes6,address)'),
        id(cauldron.interface, 'addIlks(bytes6,bytes6[])'),
        id(cauldron.interface, 'setDebtLimits(bytes6,bytes6,uint96,uint24,uint8)'),
        id(cauldron.interface, 'setLendingOracle(bytes6,address)'),
        id(cauldron.interface, 'setSpotOracle(bytes6,bytes6,address,uint32)'),
      ],
      wand.address,
    ]),
  })
  console.log(`cauldron.grantRoles(wand)`)

  proposal.push({
    target: ladle.address,
    data: ladle.interface.encodeFunctionData('grantRoles', [
      [id(ladle.interface, 'addJoin(bytes6,address)'), id(ladle.interface, 'addPool(bytes6,address)')],
      wand.address,
    ]),
  })
  console.log(`ladle.grantRoles(wand)`)

  proposal.push({
    target: joinFactory.address,
    data: joinFactory.interface.encodeFunctionData('grantRoles', [
      [id(joinFactory.interface, 'createJoin(address)')],
      wand.address,
    ]),
  })
  console.log(`joinFactory.grantRoles(wand)`)

  proposal.push({
    target: fyTokenFactory.address,
    data: fyTokenFactory.interface.encodeFunctionData('grantRoles', [
      [id(fyTokenFactory.interface, 'createFYToken(bytes6,address,address,uint32,string,string)')],
      wand.address,
    ]),
  })
  console.log(`fyTokenFactory.grantRoles(wand)`)

  proposal.push({
    target: poolFactory.address,
    data: poolFactory.interface.encodeFunctionData('grantRoles', [
      [id(poolFactory.interface, 'createPool(address,address)')],
      wand.address,
    ]),
  })
  console.log(`poolFactory.grantRoles(wand)`)

  const plan = [
    {
      contact: cauldron.address,
      signatures: [
        id(cauldron.interface, 'addAsset(bytes6,address)'),
        id(cauldron.interface, 'addSeries(bytes6,bytes6,address)'),
        id(cauldron.interface, 'addIlks(bytes6,bytes6[])'),
        id(cauldron.interface, 'setDebtLimits(bytes6,bytes6,uint96,uint24,uint8)'),
        id(cauldron.interface, 'setLendingOracle(bytes6,address)'),
        id(cauldron.interface, 'setSpotOracle(bytes6,bytes6,address,uint32)'),
      ],
    },
    {
      contact: ladle.address,
      signatures: [id(ladle.interface, 'addJoin(bytes6,address)'), id(ladle.interface, 'addPool(bytes6,address)')],
    },
    {
      contact: joinFactory.address,
      signatures: [id(joinFactory.interface, 'createJoin(address)')],
    },
    {
      contact: fyTokenFactory.address,
      signatures: [id(fyTokenFactory.interface, 'createFYToken(bytes6,address,address,uint32,string,string)')],
    },
    {
      contact: poolFactory.address,
      signatures: [id(poolFactory.interface, 'createPool(address,address)')],
    },
  ]

  proposal.push({
    target: cloak.address,
    data: cloak.interface.encodeFunctionData('plan', [wand.address, plan]),
  })
  console.log(`cloak.plan(wand): ${await cloak.hash(wand.address, plan)}`)

  return proposal
}

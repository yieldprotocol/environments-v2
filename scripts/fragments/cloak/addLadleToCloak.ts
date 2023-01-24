import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { id } from '@yield-protocol/utils-v2'
import { Cauldron, EmergencyBrake, FYToken__factory, Join__factory, Ladle } from '../../../typechain'
import { indent } from '../../../shared/helpers'

export const addLadleToCloak = async (
  signerAcc: SignerWithAddress,
  cloak: EmergencyBrake,
  cauldron: Cauldron,
  ladle: Ladle,
  fyTokens: Map<string, string>,
  joins: Map<string, string>,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ADD_LADLE_TO_CLOAK`))
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: cloak.address,
    data: cloak.interface.encodeFunctionData('add', [
      ladle.address,
      [
        {
          host: cauldron.address,
          signature: id(cauldron.interface, 'build(address,bytes12,bytes6,bytes6)'),
        },
        {
          host: cauldron.address,
          signature: id(cauldron.interface, 'destroy(bytes12)'),
        },
        {
          host: cauldron.address,
          signature: id(cauldron.interface, 'tweak(bytes12,bytes6,bytes6)'),
        },
        {
          host: cauldron.address,
          signature: id(cauldron.interface, 'pour(bytes12,int128,int128)'),
        },
        {
          host: cauldron.address,
          signature: id(cauldron.interface, 'stir(bytes12,bytes12,uint128,uint128)'),
        },
        {
          host: cauldron.address,
          signature: id(cauldron.interface, 'roll(bytes12,bytes6,int128)'),
        },
      ],
    ]),
  })
  console.log(indent(nesting, `cloak.add(ladle to cauldron)`))

  for (let [seriesId, fyTokenAddress] of fyTokens) {
    const fyToken = FYToken__factory.connect(fyTokenAddress, signerAcc)
    proposal.push({
      target: cloak.address,
      data: cloak.interface.encodeFunctionData('add', [
        ladle.address,
        [
          {
            host: fyToken.address,
            signature: id(fyToken.interface, 'mint(address,uint256)'),
          },
          {
            host: fyToken.address,
            signature: id(fyToken.interface, 'burn(address,uint256)'),
          },
        ],
      ]),
    })
    console.log(indent(nesting, `cloak.add(ladle mint and burn ${seriesId})`))
  }

  for (let [assetId, joinAddress] of joins) {
    const join = Join__factory.connect(joinAddress, signerAcc)
    if ((await join.hasRole(id(join.interface, 'join(address,uint128)'), ladle.address)) == true) {
      proposal.push({
        target: cloak.address,
        data: cloak.interface.encodeFunctionData('add', [
          ladle.address,
          [
            {
              host: join.address,
              signature: id(join.interface, 'join(address,uint128)'),
            },
            {
              host: join.address,
              signature: id(join.interface, 'exit(address,uint128)'),
            },
          ],
        ]),
      })
      console.log(indent(nesting, `cloak.add(ladle join and exit ${assetId})`))
    }
  }

  return proposal
}

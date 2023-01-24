import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { id } from '@yield-protocol/utils-v2'
import { Cauldron, EmergencyBrake, FYToken__factory, Join__factory, Witch } from '../../../typechain'
import { indent } from '../../../shared/helpers'

export const addWitchToCloak = async (
  signerAcc: SignerWithAddress,
  cloak: EmergencyBrake,
  cauldron: Cauldron,
  witch: Witch,
  fyTokens: Map<string, string>,
  joins: Map<string, string>,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ADD_WITCH_TO_CLOAK`))
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: cloak.address,
    data: cloak.interface.encodeFunctionData('add', [
      witch.address,
      [
        {
          host: cauldron.address,
          signature: id(cauldron.interface, 'give(bytes12,address)'),
        },
        {
          host: cauldron.address,
          signature: id(cauldron.interface, 'slurp(bytes12,uint128,uint128)'),
        },
      ],
    ]),
  })
  console.log(indent(nesting, `cloak.add(witch give and slurp)`))

  for (let [seriesId, fyTokenAddress] of fyTokens) {
    const fyToken = FYToken__factory.connect(fyTokenAddress, signerAcc)
    if ((await fyToken.hasRole(id(fyToken.interface, 'burn(address,uint256)'), witch.address)) == true) {
      proposal.push({
        target: cloak.address,
        data: cloak.interface.encodeFunctionData('add', [
          witch.address,
          [
            {
              host: fyToken.address,
              signature: id(fyToken.interface, 'burn(address,uint256)'),
            },
          ],
        ]),
      })
      console.log(indent(nesting, `cloak.add(witch burn ${seriesId})`))
    }
  }

  for (let [assetId, joinAddress] of joins) {
    const join = Join__factory.connect(joinAddress, signerAcc)
    if ((await join.hasRole(id(join.interface, 'join(address,uint128)'), witch.address)) == true) {
      proposal.push({
        target: cloak.address,
        data: cloak.interface.encodeFunctionData('add', [
          witch.address,
          [
            {
              host: join.address,
              signature: id(join.interface, 'join(address,uint128)'),
            },
          ],
        ]),
      })
      console.log(indent(nesting, `cloak.add(witch join ${assetId})`))
    }

    if ((await join.hasRole(id(join.interface, 'exit(address,uint128)'), witch.address)) == true) {
      proposal.push({
        target: cloak.address,
        data: cloak.interface.encodeFunctionData('add', [
          witch.address,
          [
            {
              host: join.address,
              signature: id(join.interface, 'exit(address,uint128)'),
            },
          ],
        ]),
      })
      console.log(indent(nesting, `cloak.add(witch exit ${assetId})`))
    }
  }

  return proposal
}

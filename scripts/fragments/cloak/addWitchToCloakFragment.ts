import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { id } from '@yield-protocol/utils-v2'
import { Cauldron, EmergencyBrake, FYToken__factory, Join__factory, Witch } from '../../../typechain'

export const addWitchToCloakFragment = async (
  signerAcc: SignerWithAddress,
  cloak: EmergencyBrake,
  cauldron: Cauldron,
  witch: Witch,
  fyTokens: Map<string, string>,
  joins: Map<string, string>
): Promise<Array<{ target: string; data: string }>> => {
  const baseJoin = Join__factory.connect(await fyToken.join(), signerAcc)

  const proposal: Array<{ target: string; data: string }> = []

  for (let [seriesId, fyTokenAddress] of fyTokens) {
    const fyToken = FYToken__factory.connect(fyTokenAddress, signerAcc)

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
    console.log(`cloak.add(witch ${seriesId})`)
  }

  for (let [assetId, joinAddress] of joins) {
  }

  return proposal
}

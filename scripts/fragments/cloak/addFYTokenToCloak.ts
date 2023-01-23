import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { id } from '@yield-protocol/utils-v2'
import { EmergencyBrake, FYToken__factory, Join__factory } from '../../../typechain'

export const addFYTokenToCloak = async (
  signerAcc: SignerWithAddress,
  cloak: EmergencyBrake,
  fyTokens: Map<string, string>
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []

  for (let [seriesId, fyTokenAddress] of fyTokens) {
    const fyToken = FYToken__factory.connect(fyTokenAddress, signerAcc)
    const baseJoin = Join__factory.connect(await fyToken.join(), signerAcc)

    proposal.push({
      target: cloak.address,
      data: cloak.interface.encodeFunctionData('add', [
        fyToken.address,
        [
          {
            host: baseJoin.address,
            signature: id(baseJoin.interface, 'join(address,uint128)'),
          },
          {
            host: baseJoin.address,
            signature: id(baseJoin.interface, 'exit(address,uint128)'),
          },
        ],
      ]),
    })
    console.log(`cloak.add(fyToken ${seriesId} join and exit ${await fyToken.underlyingId()})`)
  }

  return proposal
}

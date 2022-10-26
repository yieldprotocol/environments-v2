import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { id } from '@yield-protocol/utils-v2'
import { EmergencyBrake, FYToken, Join__factory } from '../../../typechain'

export const addFYTokenToCloakFragment = async (
  signerAcc: SignerWithAddress,
  cloak: EmergencyBrake,
  fyToken: FYToken
): Promise<Array<{ target: string; data: string }>> => {
  const baseJoin = Join__factory.connect(await fyToken.join(), signerAcc)

  const proposal: Array<{ target: string; data: string }> = []

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
  console.log(`cloak.add(fyToken ${fyToken.address} on ${await fyToken.underlyingId} join)`)

  return proposal
}

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ROOT } from '../../../shared/constants'
import { AccessControl__factory } from '../../../typechain'

export const revokeRootFragment = async (
  signerAcc: SignerWithAddress,
  user: string,
  hosts: Array<string>
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []

  for (let hostAddress of hosts) {
    const host = AccessControl__factory.connect(hostAddress, signerAcc)
    proposal.push({
      target: host.address,
      data: host.interface.encodeFunctionData('revokeRole', [ROOT, user]),
    })
    console.log(`${host.address} revokeRole(ROOT ${user})`)
  }

  return proposal
}

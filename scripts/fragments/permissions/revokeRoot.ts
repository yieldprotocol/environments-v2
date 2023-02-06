import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ROOT } from '../../../shared/constants'
import { AccessControl__factory } from '../../../typechain'
import { indent } from '../../../shared/helpers'

export const revokeRoot = async (
  signerAcc: SignerWithAddress,
  user: string,
  hosts: Array<string>,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `REVOKE_ROOT`))
  const proposal: Array<{ target: string; data: string }> = []

  for (let hostAddress of hosts) {
    const host = AccessControl__factory.connect(hostAddress, signerAcc)
    proposal.push({
      target: host.address,
      data: host.interface.encodeFunctionData('revokeRole', [ROOT, user]),
    })
    console.log(indent(nesting, `${host.address} revokeRole(ROOT ${user})`))
  }

  return proposal
}

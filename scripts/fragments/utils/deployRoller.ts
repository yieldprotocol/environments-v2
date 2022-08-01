import { ethers, waffle } from 'hardhat'
import { verify } from '../../../shared/helpers'
import { ROOT } from '../../../shared/constants'
import RollerArtifact from '../../../artifacts/contracts/Roller.sol/Roller.json'

import { Roller, Timelock } from '../../../typechain'

const { deployContract } = waffle

/**
 * @dev This script deploys the Roller
 */
export const deployRoller = async (
  ownerAcc: any,
  protocol: Map<string, string>,
  timelock: Timelock
): Promise<Roller> => {
  let roller: Roller
  if (protocol.get('roller') === undefined) {
    roller = (await deployContract(ownerAcc, RollerArtifact, [protocol.get('ladle') as string])) as Roller
    console.log(`Roller deployed at ${roller.address}`)
    verify(roller.address, [])
  } else {
    roller = (await ethers.getContractAt('Roller', protocol.get('roller') as string, ownerAcc)) as Roller
    console.log(`Reusing Roller at ${roller.address}`)
  }

  if (!(await roller.hasRole(ROOT, timelock.address))) {
    await roller.grantRole(ROOT, timelock.address)
    console.log(`roller.grantRoles(ROOT, timelock)`)
    while (!(await roller.hasRole(ROOT, timelock.address))) {}
  }

  return roller
}

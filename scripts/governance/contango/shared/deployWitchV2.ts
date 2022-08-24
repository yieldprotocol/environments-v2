import { ethers, network } from 'hardhat'
import { ROOT, witchV2_key } from '../../../../shared/constants'
import { verify } from '../../../../shared/helpers'
import { Witch } from '../../../../typechain'
const hre = require('hardhat')
/**
 * @dev This script deploys the Witch
 * The Timelock gets ROOT access.
 */
export const deployWitchV2 = async (
  ownerAcc: any,
  protocol: Map<string, string>,
  governance: Map<string, string>
): Promise<Witch> => {
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc)

  const cauldronAddress = protocol.get('contangoCauldron')
  const ladleAddress = protocol.get('contangoLadle')

  let witchV2: Witch

  if (cauldronAddress && ladleAddress) {
    const witchV2Address = protocol.get(witchV2_key)
    if (witchV2Address === undefined) {
      const _witchV2 = await (await ethers.getContractFactory('Witch')).deploy(cauldronAddress, ladleAddress)
      witchV2 = await _witchV2.deployed()
      console.log(`Witch deployed at ${witchV2.address}`)
      verify(witchV2.address, [cauldronAddress, ladleAddress])
      if (network.name == 'tenderly') {
        await hre.tenderly.persistArtifacts({
          name: 'Witch',
          address: witchV2.address,
        })

        await hre.tenderly.verify({
          name: 'Witch',
          address: witchV2.address,
        })
      }
    } else {
      witchV2 = await ethers.getContractAt('Witch', witchV2Address, ownerAcc)
    }
  } else throw new Error('contangoCauldron or contangoLadle are not deployed!')

  if (!(await witchV2.hasRole(ROOT, timelock.address))) {
    await witchV2.grantRole(ROOT, timelock.address)
    console.log(`witch.grantRoles(ROOT, timelock)`)
    while (!(await witchV2.hasRole(ROOT, timelock.address))) {}
  }

  return witchV2
}

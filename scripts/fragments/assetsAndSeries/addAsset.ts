import { ethers } from 'hardhat'
import { ZERO_ADDRESS } from '../../../shared/constants'
import { addJoin } from '../ladle/addJoin'
import { EmergencyBrake, Cauldron, Ladle } from '../../../typechain'

export const addAsset = async (
  ownerAcc: any,
  cloak: EmergencyBrake,
  cauldron: Cauldron,
  ladle: Ladle,
  assets: [string, string, string][]
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []
  for (let [assetId, assetAddress, joinAddress] of assets) {
    if ((await ethers.provider.getCode(assetAddress)) === '0x') throw `Address ${assetAddress} contains no code`
    console.log(`Using asset at ${assetAddress}`)

    if ((await ethers.provider.getCode(joinAddress)) === '0x') throw `Address ${joinAddress} contains no code`
    const join = await ethers.getContractAt('Join', joinAddress, ownerAcc)
    console.log(`Using join at ${joinAddress}`)

    if ((await cauldron.assets(assetId)) === ZERO_ADDRESS) {
      // Add asset to Cauldron
      proposal.push({
        target: cauldron.address,
        data: cauldron.interface.encodeFunctionData('addAsset', [assetId, assetAddress]),
      })
    }

    // Allow Ladle to join and exit on the asset Join
    proposal.concat(await addJoin(cloak, ladle, assetId, join))
  }

  return proposal
}

/**
 * @dev This script makes one or more assets into ilks for one or more bases.
 *
 * It takes as inputs the governance and protocol address files.
 * It uses the Wand to set the spot oracle, debt limits, and allow the Witch to liquidate collateral.
 * A plan is recorded in the Cloak to isolate the Join from the Witch.
 */

import { WAD } from '../../../../shared/constants'
import { bytesToBytes32, bytesToString } from '../../../../shared/helpers'
import { Cauldron, IOracle } from '../../../../typechain'

export const makeIlkProposal = async (
  spotOracle: IOracle,
  cauldron: Cauldron,
  debtLimits: Array<[string, string, number, number, number, number]>
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []

  // Contango Witch cannot be deployed yet, it depends on Contango being deployed already
  // Deploying + configuring the WitchV2 will be done in a separate proposal

  //  for (let [ilkId, duration, initialOffer, auctionLine, auctionDust, ilkDec] of auctionLimits) {
  //    console.log(ilkId)
  //    const join = (await ethers.getContractAt('Join', joins.get(ilkId) as string, ownerAcc)) as Join

  //    // Configure auction limits for the ilk on the witch
  //    proposal.push({
  //      target: witch.address,
  //      data: witch.interface.encodeFunctionData('setIlk', [
  //        ilkId,
  //        duration,
  //        initialOffer,
  //        auctionLine,
  //        auctionDust,
  //        ilkDec,
  //      ]),
  //    })
  //    console.log(`Asset ${bytesToString(ilkId)} set as ilk on witch at ${witch.address}`)

  //    // Allow Witch to exit ilk
  //    proposal.push({
  //      target: join.address,
  //      data: join.interface.encodeFunctionData('grantRoles', [
  //        [id(join.interface, 'exit(address,uint128)')],
  //        witch.address,
  //      ]),
  //    })

  //    // Log a plan to undo the orchestration above in emergencies
  //    const plan = [
  //      {
  //        contact: join.address,
  //        signatures: [id(join.interface, 'exit(address,uint128)')],
  //      },
  //    ]

  //    if ((await cloak.plans(await cloak.hash(witch.address, plan))).state === 0) {
  //      proposal.push({
  //        target: cloak.address,
  //        data: cloak.interface.encodeFunctionData('plan', [witch.address, plan]),
  //      })
  //      console.log(`cloak.plan(witch, join(${bytesToString(ilkId)})): ${await cloak.hash(witch.address, plan)}`)
  //    }
  //  }

  for (let [baseId, ilkId, ratio, line, dust, dec] of debtLimits) {
    // This step in the proposal ensures that the source has been added to the oracle, `peek` will fail with 'Source not found' if not
    console.log(`Adding for ${bytesToString(baseId)}/${bytesToString(ilkId)} from ${spotOracle.address as string}`)
    proposal.push({
      target: spotOracle.address,
      data: spotOracle.interface.encodeFunctionData('peek', [bytesToBytes32(baseId), bytesToBytes32(ilkId), WAD]),
    })

    // Set the spot oracle in the Cauldron
    proposal.push({
      target: cauldron.address,
      data: cauldron.interface.encodeFunctionData('setSpotOracle', [baseId, ilkId, spotOracle.address, ratio]),
    })

    // Set the base/ilk limits in the Cauldron
    proposal.push({
      target: cauldron.address,
      data: cauldron.interface.encodeFunctionData('setDebtLimits', [baseId, ilkId, line, dust, dec]),
    })
  }

  return proposal
}

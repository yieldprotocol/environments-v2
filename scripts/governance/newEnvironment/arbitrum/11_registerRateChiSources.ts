/**
 * @dev This script replaces one or more chi data sources in the CompoundMultiOracle.
 *
 * It takes as inputs the governance, protocol and chiSources json address files.
 * It rewrites the chiSources json address file.
 */

import { bytesToString, } from '../../../shared/helpers'
import { CHI, DAI, RATE, USDC, WAD } from '../../../shared/constants'

import { DeployedContext } from '../../../core/contexts'


(async () => {
  const ctx = await DeployedContext.create();

  // base, string, start rate, per second rate multiplier
  const newSources: Array<[string, string, string, string]> = [
    [DAI, CHI, WAD.toString(), WAD.toString()],
    [DAI, RATE, WAD.toString(), WAD.toString()],
    [USDC, CHI, WAD.toString(), WAD.toString()],
    [USDC, RATE, WAD.toString(), WAD.toString()],
  ]

  const proposal: Array<{ target: string; data: string }> = []
  for (let [baseId, kind, start_rate, per_second_rate] of newSources) {
    {
      const existing_source = (await ctx.accumulatorMultiOracle.sources(baseId, kind));
      if (!existing_source[0].isZero() || !existing_source[1].isZero()) {
        console.log(`WARNING: ${baseId} already has ${bytesToString(kind)} source: ${JSON.stringify(existing_source)}`)
        if (existing_source[0].toString() != per_second_rate) {
          throw new Error(`${baseId} already has ${bytesToString(kind)} source with different per-second rate`)
        }
        if (existing_source[1].toString() != start_rate) {
          throw new Error(`${baseId} already has ${bytesToString(kind)} source with different start rate`)
        }
      }
    }
    proposal.push({
      target: ctx.accumulatorMultiOracle.address,
      data: ctx.accumulatorMultiOracle.interface.encodeFunctionData('setSource', [baseId, kind, start_rate, per_second_rate]),
    })
    console.log(`[${bytesToString(kind)}(${bytesToString(baseId)}): ${start_rate} ; ${per_second_rate}],`)
  }
  await ctx.proposeApproveExecute(proposal);
})()

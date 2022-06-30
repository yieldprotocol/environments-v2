/**
 * @dev This script replaces one or more data sources in a YieldSpaceMultiOracle.
 */
import { YieldSpaceMultiOracle } from '../../../typechain'
import { FYTokenSource } from '../../governance/add/addCollateral/addFYTokenCollateral/types';
 
export const updateYieldSpaceMultiOracleSourcesProposal = async (
  oracle: YieldSpaceMultiOracle,
  sources: FYTokenSource[] // seriesId (bytes6), baseId (bytes6), pool (address)
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []
  for (let { seriesId, baseId, pool: poolAddress } of sources) {
    console.log(`Setting up ${poolAddress} as the source for ${seriesId}/${baseId} at ${oracle.address}`)

    proposal.push({
      target: oracle.address,
      data: oracle.interface.encodeFunctionData('setSource', [seriesId, baseId, poolAddress]),
    })
  }

  return proposal
}
 
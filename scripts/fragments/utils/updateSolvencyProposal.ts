import { Solvency } from '../../../typechain'

export const updateSolvencyProposal = async (
  solvency: Solvency,
  newJoins: Array<string>,
  newSeries: Array<string>
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: solvency.address,
    data: solvency.interface.encodeFunctionData('addAssetIds', [newJoins]),
  })

  proposal.push({
    target: solvency.address,
    data: solvency.interface.encodeFunctionData('addSeriesIds', [newSeries]),
  })

  return proposal
}

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import {
  Cauldron,
  CompositeMultiOracle,
  ContangoLadle,
  ContangoWitch,
  EmergencyBrake,
  Join,
  Timelock,
  YieldSpaceMultiOracle,
} from '../../../../typechain'
import { addAsset } from '../../../fragments/assetsAndSeries/addAsset'
import { addSeries } from '../../../fragments/assetsAndSeries/addSeries'
import { makeBase } from '../../../fragments/assetsAndSeries/makeBase'
import { makeIlk } from '../../../fragments/assetsAndSeries/makeIlk'
import { orchestrateJoin } from '../../../fragments/assetsAndSeries/orchestrateJoin'
import { updateCompositePaths } from '../../../fragments/oracles/updateCompositePaths'
import { updateCompositeSources } from '../../../fragments/oracles/updateCompositeSources'
import { updateYieldSpaceMultiOracleSources } from '../../../fragments/oracles/updateYieldSpaceMultiOracleSources'
import { updateYieldSpaceMultiOracleSource } from '../../../fragments/oracles/updateYieldSpaceMultiOracleSources'
import { Asset, Base, OraclePath, OracleSource, Series } from '../../confTypes'

export async function orchestrateNewInstruments(
  ownerAcc: SignerWithAddress,
  cauldron: Cauldron,
  ladle: ContangoLadle,
  witch: ContangoWitch,
  cloak: EmergencyBrake,
  compositeMultiOracle: CompositeMultiOracle,
  yieldSpaceMultiOracle: YieldSpaceMultiOracle,
  timelock: Timelock,
  joins: Join[],
  assets: Asset[],
  compositeSources: OracleSource[],
  compositePaths: OraclePath[],
  pools: Map<string, string>,
  joinsMap: Map<string, string>,
  series: Series[],
  basesToAdd: Base[]
) {
  const promises = [
    joins.map((join) => orchestrateJoin(ownerAcc.address, timelock, cloak, join)),
    updateYieldSpaceMultiOracleSources(yieldSpaceMultiOracle, compositeSources, pools),
    updateCompositeSources(compositeMultiOracle, compositeSources, true),
    updateCompositePaths(compositeMultiOracle, compositePaths),
    assets.map((asset) => addAsset(ownerAcc, cloak, cauldron, ladle, asset, joinsMap)),
    series
      .map((series) => series.ilks)
      .flat()
      .map((ilk) => makeIlk(ownerAcc, cloak, cauldron, witch, ilk, joinsMap)),
    series.map((series) => addSeries(ownerAcc, cauldron, ladle, witch, cloak, series, pools)),
  ].flat(4)

  const result = await Promise.all(promises).then((x) => x.flat())
  const uniqueArray = removeDuplicates(result)
  return uniqueArray
}

function removeDuplicates<T>(array: T[]): T[] {
  const uniqueMap: { [key: string]: T } = {}
  const uniqueArray: T[] = []

  for (const item of array) {
    const key = JSON.stringify(item)
    if (!uniqueMap[key]) {
      uniqueMap[key] = item
      uniqueArray.push(item)
    }
  }

  return uniqueArray
}

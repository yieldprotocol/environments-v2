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
import { addIlkToSeries } from '../../../fragments/assetsAndSeries/addIlkToSeries'
import { addSeries } from '../../../fragments/assetsAndSeries/addSeries'
import { makeIlk } from '../../../fragments/assetsAndSeries/makeIlk'
import { orchestrateJoin } from '../../../fragments/assetsAndSeries/orchestrateJoin'
import { updateCompositePaths } from '../../../fragments/oracles/updateCompositePaths'
import { updateCompositeSources } from '../../../fragments/oracles/updateCompositeSources'
import { updateYieldSpaceMultiOracleSources } from '../../../fragments/oracles/updateYieldSpaceMultiOracleSources'
import { Asset, Ilk, OraclePath, OracleSource, Series } from '../../confTypes'

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
  ilks: Ilk[]
) {
  const promises = [
    joins.map((join) => orchestrateJoin(ownerAcc.address, timelock, cloak, join)),
    updateYieldSpaceMultiOracleSources(yieldSpaceMultiOracle, compositeSources, pools),
    updateCompositeSources(compositeMultiOracle, compositeSources, true),
    updateCompositePaths(compositeMultiOracle, compositePaths),
    assets.map((asset) => addAsset(ownerAcc, cloak, cauldron, ladle, asset, joinsMap)),
    series.map((series) => [
      addSeries(ownerAcc, cauldron, ladle, witch, cloak, series, pools),
      ilks.map((ilk) => [
        makeIlk(ownerAcc, cloak, cauldron, witch, ilk, joinsMap),
        addIlkToSeries(cauldron, series, ilk),
      ]),
    ]),
  ].flat(4)

  return Promise.all(promises).then((x) => x.flat(1))
}

import { ethers } from 'hardhat';

import { getContract, proposeApproveExecute, readAddressMappingIfExists } from '../../../shared/helpers';
import { AccumulatorMultiOracle, Cauldron, ChainlinkUSDMultiOracle, EmergencyBrake, Join, Ladle, Pool, Timelock, Wand, Witch } from '../../../typechain'

export type Proposal = Array<{ target: string; data: string }>;

/**
 * Context class that represents a fully *deployed* Yield environment
 * 
 * A type-safe collection of contracts and address mappings
 */
export class DeployedContext {
  constructor(
    readonly assets: Map<string, string>,
    readonly governance: Map<string, string>,
    readonly protocol: Map<string, string>,
    readonly pools: Map<string, string>,

    readonly ROOT: string,

    readonly owner: any,

    readonly timelock: Timelock,
    readonly cloak: EmergencyBrake,

    readonly accumulatorMultiOracle: AccumulatorMultiOracle,
    readonly chainlinkUSDMultiOracle: ChainlinkUSDMultiOracle,
    readonly cauldron: Cauldron,
    readonly wand: Wand,
    readonly ladle: Ladle,
    readonly witch: Witch,
  ) { };

  static async create(): Promise<DeployedContext> {
    const assets = readAddressMappingIfExists('assets.json');
    const governance = readAddressMappingIfExists('governance.json');
    const protocol = readAddressMappingIfExists('protocol.json');
    const pools = readAddressMappingIfExists('pools.json');
    const [owner] = await ethers.getSigners();

    const timelock = await getContract<Timelock>(owner, "Timelock", governance.get("timelock"));


    return new DeployedContext(
      assets,
      governance,
      protocol,
      pools,

      await timelock.ROOT(),

      owner,
      timelock,
      await getContract<EmergencyBrake>(owner, "EmergencyBrake", governance.get("cloak")),
      await getContract<AccumulatorMultiOracle>(owner, "AccumulatorMultiOracle", protocol.get("accumulatorOracle")),
      await getContract<ChainlinkUSDMultiOracle>(owner, "ChainlinkUSDMultiOracle", protocol.get("chainlinkUSDOracle")),
      await getContract<Cauldron>(owner, "Cauldron", protocol.get("cauldron")),
      await getContract<Wand>(owner, "Wand", protocol.get("wand")),
      await getContract<Ladle>(owner, "Ladle", protocol.get("ladle")),
      await getContract<Witch>(owner, "Witch", protocol.get("witch")),
    );
  }

  /**
   * Find the asset registered in Cauldron by its ID
   */
  async getRegisteredAssetAddress(assetId: string): Promise<string> {
    return this.cauldron.assets(assetId);
  }

  /**
   * Find the pool registered in Ladle by its series ID
   */
  async getPoolForSeries(seriesId: string): Promise<Pool> {
    return getContract<Pool>(this.owner, "Pool", await this.ladle.pools(seriesId));
  }

  /**
   * Find the Join registered in Ladle by the asset ID
   */
  async getJoinForAsset(assetId: string): Promise<Join> {
    return getContract<Join>(this.owner, "Join", await this.ladle.joins(assetId));
  }

  /**
   * Propose, approve, execute a proposal, either step-by-step or all in one shot
   */
  async proposeApproveExecute(proposal: Proposal, all_the_way = false) {
    for (let runs = 0; runs < (all_the_way ? 3 : 1); ++runs) {
      await proposeApproveExecute(this.timelock, proposal, this.governance.get('multisig') as string);
    }
  }
}
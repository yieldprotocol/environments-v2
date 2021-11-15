/**
 * @dev This script initializes pools in the protocol.
 *
 * It takes as inputs the governance and pools json address files.
 */

import { DAI, USDC } from '../../../../shared/constants'

import { DeployedContext } from '../../../core/contexts'
import { deployStrategy, proposeStrategyACL, StrategyData } from '../../strategies'


(async () => {
  const ctx = await DeployedContext.create();
  
  const strategiesData: Array<StrategyData> = [
    new StrategyData('Yield Strategy DAI 6M Mar Sep',  'YSDAI6MMS',  DAI),
    new StrategyData('Yield Strategy DAI 6M Jun Dec',  'YSDAI6MJD',  DAI),
    new StrategyData('Yield Strategy USDC 6M Mar Sep', 'YSUSDC6MMS', USDC),
    new StrategyData('Yield Strategy USDC 6M Jun Dec', 'YSUSDC6MJD', USDC),
  ];

  let proposal: Array<{ target: string; data: string }> = [];
  for (const strategyData of strategiesData) {
    const strategy = await deployStrategy(ctx, strategyData);
    proposal = proposal.concat(await proposeStrategyACL(ctx, strategy));
  }
  await ctx.proposeApproveExecute(proposal, true);
})()

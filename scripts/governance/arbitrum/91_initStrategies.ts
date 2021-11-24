/**
 * @dev This script initializes pools in the protocol.
 *
 * It takes as inputs the governance and pools json address files.
 */

import { stringToBytes6 } from '../../../shared/helpers'
import { DeployedContext } from '../../../core/contexts'
import { proposeStrategyInit, StrategyInitData } from '../../strategies'


(async () => {
  const ctx = await DeployedContext.create();
  
  const data: Array<StrategyInitData> = [
    new StrategyInitData('YSDAI6MMS', stringToBytes6('0105'), stringToBytes6('0105')),
    new StrategyInitData('YSDAI6MJD', stringToBytes6('0104'), stringToBytes6('0104')),
    new StrategyInitData('YSUSDC6MMS', stringToBytes6('0205'), stringToBytes6('0205')),
    new StrategyInitData('YSUSDC6MJD', stringToBytes6('0204'), stringToBytes6('0204')),
  ];

  let proposal: Array<{ target: string; data: string }> = [];
  for (const init_data of data) {
    proposal = proposal.concat(await proposeStrategyInit(ctx, init_data));
  }
  await ctx.proposeApproveExecute(proposal, true);
})()

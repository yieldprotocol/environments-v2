import { proposeApproveExecute } from '../../../shared/helpers'

import { SpotSourceUSD, updateSpotUSDSourcesProposal } from '../../fragments/oracles/updateSpotSourcesProposal'

import { DAI, ETH, USDC } from '../../../shared/constants'
import { DeployedContext } from '../../../core/contexts'

(async () => {
  const ctx = await DeployedContext.create();

  const spotSources: Array<SpotSourceUSD> = [
    // https://docs.chain.link/docs/arbitrum-price-feeds/
    new SpotSourceUSD(USDC, await ctx.assets.get(USDC)!, "chainlinkUSDOracle", "0xe020609A0C31f4F96dCBB8DF9882218952dD95c4"),
    new SpotSourceUSD(DAI, await ctx.assets.get(DAI)!, "chainlinkUSDOracle", "0xcAE7d280828cf4a0869b26341155E4E9b864C7b2"),
    new SpotSourceUSD(ETH, await ctx.assets.get(ETH)!, "chainlinkUSDOracle", "0x5f0423B1a6935dc5596e7A24d98532b67A0AeFd8"),
  ]

  let proposal = await updateSpotUSDSourcesProposal(ctx.owner, spotSources);

  await proposeApproveExecute(ctx.timelock, proposal, ctx.governance.get('multisig') as string)
})()

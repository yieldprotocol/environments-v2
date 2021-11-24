/**
 * @dev This script adds one or more series to the protocol.
 *
 * It takes as inputs the governance and protocol json address files.
 * It uses the Wand to add the series:
 *  - Deploying a fyToken and adds it to the Cauldron, permissioned for the specified ilks.
 *  - Deploying a pool and adding it to the Ladle, which gets permissions to mint and burn.
 * The Timelock and Cloak get ROOT access to the new FYToken. Root access is NOT removed from the Wand.
 * The Timelock gets access to governance functions in the new FYToken.
 * A plan is recorded in the Cloak to isolate the FYToken from the Ladle.
 * It adds to the fyTokens and pools json address files.
 * @notice Adding one series is 6M gas, maybe add just one per proposal
 */

import { id } from '@yield-protocol/utils-v2'
import { bytesToString, getAddressMappingFilePath, getContract, readAddressMappingIfExists, stringToBytes6, verify, writeAddressMap } from '../../../../shared/helpers'
import { ETH, DAI, USDC } from '../../../../shared/constants'

import { FYToken, Pool } from '../../../../typechain'

import { DeployedContext } from '../../../core/contexts'


(async () => {
  const ctx = await DeployedContext.create();

  const FY_TOKENS_FILE = 'fyTokens.json';
  const POOLS_FILE = 'pools.json';  

  const fyTokens = readAddressMappingIfExists(FY_TOKENS_FILE);
  const pools = readAddressMappingIfExists(POOLS_FILE);

  const EODEC21 = 1640919600
  const EOMAR22 = 1648177200

  const newSeries: Array<[string, string, number, string[], string, string]> = [
    [stringToBytes6('0104'), DAI, EODEC21, [ETH, DAI, USDC], 'FYDAI2112', 'FYDAI2112'], // Dec21
    [stringToBytes6('0105'), DAI, EOMAR22, [ETH, DAI, USDC], 'FYDAI2203', 'FYDAI2203'], // Mar22
    [stringToBytes6('0204'), USDC, EODEC21, [ETH, DAI, USDC], 'FYUSDC2112', 'FYUSDC2112'],
    [stringToBytes6('0205'), USDC, EOMAR22, [ETH, DAI, USDC], 'FYUSDC2203', 'FYUSDC2203'],
  ]  

  // Each series costs 10M gas to deploy, so there is no bundling of several series in a single proposal
  for (let [seriesId, baseId, maturity, ilkIds, name, symbol] of newSeries) {
    console.log(`>>> Creating ${name}`)
    // Build the proposal
    let proposal: Array<{ target: string; data: string }> = []

    proposal.push({
      target: ctx.wand.address,
      data: ctx.wand.interface.encodeFunctionData('addSeries', [seriesId, baseId, maturity, ilkIds, name, symbol]),
    })
    await ctx.proposeApproveExecute(proposal, true);

    // The fyToken and pools files can only be updated after the successful execution of the proposal
    const fyToken = await getContract<FYToken>(ctx.owner, "FYToken", (await ctx.cauldron.series(seriesId)).fyToken);
    console.log(`[${await fyToken.symbol()}, '${fyToken.address}'],`)
    verify(
      fyToken.address,
      [
        await fyToken.underlyingId(),
        await fyToken.oracle(),
        await fyToken.join(),
        await fyToken.maturity(),
        await fyToken.name(),
        await fyToken.symbol(),
      ],
      getAddressMappingFilePath('safeERC20Namer.js')
    )
    fyTokens.set(seriesId, fyToken.address);
    writeAddressMap(FY_TOKENS_FILE, fyTokens);

    const pool = await getContract<Pool>(ctx.owner, "Pool", await ctx.ladle.pools(seriesId));
    console.log(`[${await fyToken.symbol()}Pool, '${pool.address}'],`);
    verify(pool.address, [], getAddressMappingFilePath('safeERC20Namer.js'));
    pools.set(seriesId, pool.address);
    writeAddressMap(POOLS_FILE, pools);


    // Give access to each of the fyToken governance functions to the timelock, through a proposal to bundle them
    // Give ROOT to the cloak, Timelock already has ROOT as the deployer
    // Store a plan for isolating FYToken from Ladle and Base Join
    proposal = []

    const join = await ctx.getJoinForAsset(baseId);

    proposal.push({
      target: fyToken.address,
      data: fyToken.interface.encodeFunctionData('grantRoles', [
        [id(fyToken.interface, 'point(bytes32,address)')],
        ctx.timelock.address,
      ]),
    })
    console.log(`fyToken.grantRoles(gov, timelock)`)

    proposal.push({
      target: fyToken.address,
      data: fyToken.interface.encodeFunctionData('grantRole', [ctx.ROOT, ctx.cloak.address]),
    })
    console.log(`fyToken.grantRole(ROOT, cloak)`)

    const ladlePlan = [
      {
        contact: fyToken.address,
        signatures: [id(fyToken.interface, 'mint(address,uint256)'), id(fyToken.interface, 'burn(address,uint256)')],
      },
    ]

    proposal.push({
      target: ctx.cloak.address,
      data: ctx.cloak.interface.encodeFunctionData('plan', [ctx.ladle.address, ladlePlan]),
    })
    console.log(`cloak.plan(ladle, fyToken(${bytesToString(seriesId)})): ${await ctx.cloak.hash(ctx.ladle.address, ladlePlan)}`)

    const joinPlan = [
      {
        contact: join.address,
        signatures: [id(join.interface, 'join(address,uint128)'), id(join.interface, 'exit(address,uint128)')],
      },
    ]

    proposal.push({
      target: ctx.cloak.address,
      data: ctx.cloak.interface.encodeFunctionData('plan', [fyToken.address, joinPlan]),
    })
    console.log(`cloak.plan(fyToken, join(${bytesToString(baseId)})): ${await ctx.cloak.hash(fyToken.address, joinPlan)}`)

    await ctx.proposeApproveExecute(proposal, true);
  }  
})()

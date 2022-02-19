import { AlphaRouter, CachingGasStationProvider, EIP1559GasPriceProvider, FeeHistoryResponse, GasPrice, IGasPriceProvider, LegacyGasPriceProvider, NodeJSCache, OnChainGasPriceProvider, RawFeeHistoryResponse, setGlobalLogger } from '@uniswap/smart-order-router'

import { CurrencyAmount, Token, TradeType, Percent } from '@uniswap/sdk-core'

import { parse } from 'ts-command-line-args'
import { Logger } from 'tslog'
import NodeCache from 'node-cache';

import { providers, BigNumber, Contract } from 'ethers'
import _ from 'lodash';

const logger: Logger = new Logger()

interface Args {
  rpc_url: string
  chain_id: number
  v3_swap_router_address: string
  from_address: string
  token_in: string
  token_out: string
  amount_out: string
  duration: number
  slippage_pct: number
  silent: boolean
}

async function getDecimals(provider: providers.BaseProvider, address: string): Promise<number> {
  const erc20_abi = [
    {
      constant: true,
      inputs: [],
      name: 'decimals',
      outputs: [
        {
          name: '',
          type: 'uint8',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
  ]
  const token = new Contract(address, erc20_abi, provider)
  return await token.callStatic.decimals()
}

// Workaround for https://github.com/Uniswap/smart-order-router/issues/68
// smart-order-router fails to properly work with hardhat node - eth_feeHistory requests it sends are malformed
// This function simply copy-pastes the original EIP1559GasPriceProvider and changes the encoding of eth_feeHistory's 1st argument
function buildGasPriceProvider(provider: providers.JsonRpcProvider, chainId: number) {
  // We get the Xth percentile of priority fees for transactions successfully included in previous blocks.
  const DEFAULT_PRIORITY_FEE_PERCENTILE = 50;
  // Infura docs say only past 4 blocks guaranteed to be available: https://infura.io/docs/ethereum#operation/eth_feeHistory
  const DEFAULT_BLOCKS_TO_LOOK_BACK = 4;

  class CustomEIP1559GasPriceProvider extends IGasPriceProvider {
    constructor(
      protected provider: providers.JsonRpcProvider,
      private priorityFeePercentile: number = DEFAULT_PRIORITY_FEE_PERCENTILE,
      private blocksToConsider: number = DEFAULT_BLOCKS_TO_LOOK_BACK
    ) {
      super();
    }

    public async getGasPrice(): Promise<GasPrice> {
      const feeHistoryRaw = (await this.provider.send('eth_feeHistory', [
        "0x" + this.blocksToConsider.toString(16),
        'latest',
        [this.priorityFeePercentile],
      ])) as RawFeeHistoryResponse;

      const feeHistory: FeeHistoryResponse = {
        baseFeePerGas: _.map(feeHistoryRaw.baseFeePerGas, (b) =>
          BigNumber.from(b)
        ),
        gasUsedRatio: feeHistoryRaw.gasUsedRatio,
        oldestBlock: BigNumber.from(feeHistoryRaw.oldestBlock),
        reward: _.map(feeHistoryRaw.reward, (b) => BigNumber.from(b[0])),
      };

      const nextBlockBaseFeePerGas =
        feeHistory.baseFeePerGas[feeHistory.baseFeePerGas.length - 1]!;

      const averagePriorityFeePerGas = _.reduce(
        feeHistory.reward,
        (sum: BigNumber, cur: BigNumber) => sum.add(cur),
        BigNumber.from(0)
      ).div(feeHistory.reward.length);


      const gasPriceWei = nextBlockBaseFeePerGas.add(averagePriorityFeePerGas);

      const blockNumber = feeHistory.oldestBlock.add(this.blocksToConsider);
      return { gasPriceWei: gasPriceWei };
    }
  }

  return new CachingGasStationProvider(
    chainId,
    new OnChainGasPriceProvider(
      chainId,
      new CustomEIP1559GasPriceProvider(provider) as unknown as EIP1559GasPriceProvider,
      new LegacyGasPriceProvider(provider)
    ),
    new NodeJSCache<GasPrice>(
      new NodeCache({ stdTTL: 15, useClones: false })
    )
  );

}




async function main() {
  const args = parse<Args>({
    rpc_url: { type: String },
    chain_id: { type: Number, defaultValue: 1 },
    // https://docs.uniswap.org/protocol/reference/deployments
    v3_swap_router_address: { type: String, defaultValue: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45' },
    from_address: { type: String },
    token_in: { type: String },
    token_out: { type: String },
    amount_out: { type: String },
    duration: { type: Number, defaultValue: 300 },
    slippage_pct: { type: Number, defaultValue: 3 },
    silent: { type: Boolean, defaultValue: false },
  })

  if (args.silent) {
    logger.setSettings({ suppressStdOutput: true })
  }

  const chain_id = args.chain_id;
  const provider = new providers.JsonRpcProvider(args.rpc_url)
  const router = new AlphaRouter({ chainId: chain_id, provider, gasPriceProvider: buildGasPriceProvider(provider, chain_id) })

  const token_in = new Token(chain_id, args.token_in, await getDecimals(provider, args.token_in), '', '')

  const token_out = new Token(chain_id, args.token_out, await getDecimals(provider, args.token_out), '', '')

  const token_out_amount = CurrencyAmount.fromRawAmount(token_out, args.amount_out)

  logger.info('Router built; quoting...')
  const route = await router.route(token_out_amount, token_in, TradeType.EXACT_OUTPUT, {
    recipient: args.from_address,
    slippageTolerance: new Percent(args.slippage_pct, 100),
    deadline: (await provider.getBlock(await provider.getBlockNumber())).timestamp + args.duration,
  })

  logger.info(`Quote Exact Out: ${route!.quote.toFixed(2)}`)
  logger.info(`Gas Adjusted Quote Out: ${route!.quoteGasAdjusted.toFixed(2)}`)
  logger.info(`Gas Used USD: ${route!.estimatedGasUsedUSD.toFixed(6)}`)

  const transaction = {
    data: route!.methodParameters!.calldata,
    to: args.v3_swap_router_address,
    value: BigNumber.from(route!.methodParameters!.value).toString(),
    from: args.from_address,
    gasPrice: BigNumber.from(route!.gasPriceWei).toString(),
  }
  if (args.silent) {
    console.log(JSON.stringify(transaction))
  } else {
    logger.info('Swap parameters: ', JSON.stringify(transaction))
  }
}
main()

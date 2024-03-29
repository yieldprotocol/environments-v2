use crate::{
    bindings::{BaseIdType, VaultIdType, Witch},
    borrowers::{Borrowers, VaultMap},
    cache::ImmutableCache,
    escalator::GeometricGasPrice,
    liquidations::{AuctionMap, Liquidator},
    swap_router::SwapRouter,
    Result,
};

use ethers::prelude::*;
use serde::{Deserialize, Serialize};
use serde_with::serde_as;
use std::{
    collections::{HashMap, HashSet},
    io::Write,
    path::PathBuf,
    sync::Arc,
    time::SystemTime,
    time::{Instant, UNIX_EPOCH},
};
use tokio::time::{sleep, Duration};
use tracing::{debug_span, info, instrument, trace, warn};
use tryhard::{retry_fn, RetryFutureConfig};

#[serde_as]
#[derive(Serialize, Deserialize, Default)]
/// The state which is stored in our logs
pub struct State {
    /// The auctions being monitored
    #[serde_as(as = "Vec<(_, _)>")]
    auctions: AuctionMap,
    /// The borrowers being monitored
    #[serde_as(as = "Vec<(_, _)>")]
    vaults: VaultMap,
    /// The last observed block
    last_block: u64,
}

/// The keeper monitors the chain for both liquidation opportunities and for
/// participation in auctions using Uniswap as a liquidity source
pub struct Keeper<M> {
    client: Arc<M>,
    last_block: U64,

    cache: ImmutableCache<M>,
    borrowers: Borrowers<M>,
    liquidator: Liquidator<M>,
    instance_name: String,
}

impl<M: Middleware> Keeper<M> {
    /// Instantiates the keeper. `state` should be passed if there is previous
    /// data which should be taken into account from a previous run
    pub async fn new(
        client: Arc<M>,
        liquidations: Address,
        flashloan: Address,
        multicall2: Address,
        multicall_batch_size: usize,
        min_ratio: u16,
        gas_boost: u16,
        gas_escalator: GeometricGasPrice,
        bump_gas_delay: u64,
        target_collateral_offer: u16,
        base_to_debt_threshold: HashMap<BaseIdType, u128>,
        state: Option<State>,
        swap_router: SwapRouter,
        blocks_per_batch: Option<u64>,
        vaults_whitelist: Option<HashSet<VaultIdType>>,
        instance_name: String,
    ) -> Result<Keeper<M>, M> {
        let (vaults, auctions, last_block) = match state {
            Some(state) => (state.vaults, state.auctions, state.last_block.into()),
            None => (HashMap::new(), HashMap::new(), 0.into()),
        };
        let witch = Witch::new(liquidations, client.clone());
        let controller = witch.cauldron().call().await?;
        let borrowers = Borrowers::new(
            controller,
            liquidations,
            multicall2,
            multicall_batch_size,
            client.clone(),
            vaults,
            blocks_per_batch,
            vaults_whitelist.clone(),
            instance_name.clone(),
        )
        .await;
        let liquidator = Liquidator::new(
            swap_router,
            controller,
            liquidations,
            flashloan,
            Some(multicall2),
            min_ratio,
            gas_boost,
            target_collateral_offer,
            client.clone(),
            auctions,
            gas_escalator,
            bump_gas_delay,
            blocks_per_batch,
            vaults_whitelist,
            instance_name.clone(),
        )
        .await;

        let cache = ImmutableCache::new(
            client.clone(),
            controller,
            HashMap::new(),
            base_to_debt_threshold,
            instance_name.clone(),
        )
        .await;

        Ok(Self {
            client,
            cache,
            borrowers,
            liquidator,
            last_block,
            instance_name: instance_name.clone(),
        })
    }

    pub async fn run(&mut self, fname: PathBuf, start_block: Option<u64>) -> Result<(), M> {
        let retry_config = RetryFutureConfig::new(10)
            .exponential_backoff(Duration::from_secs(1))
            .max_delay(Duration::from_secs(30));

        // Create the initial list of borrowers from the start_block, if provided
        if let Some(start_block) = start_block {
            self.last_block = start_block.into();
        }

        let watcher = self.client.clone();
        let mut filter_id = retry_fn(|| watcher.new_filter(FilterKind::NewBlocks))
            .with_config(retry_config)
            .await
            .map_err(ContractError::MiddlewareError)?;

        let mut err_count = 0;
        let mut file: Option<std::fs::File> = None;

        let mut maybe_last_block_number: Option<u64> = None;

        let span = debug_span!("run", instance_name = self.instance_name.as_str());
        let _enter = span.enter();

        let mut last_iteration_started_at: Option<Instant> = None;
        let mut failures_in_row = 0;

        loop {
            match last_iteration_started_at {
                // don't spin
                Some(instant) if Instant::now() - instant < Duration::from_secs(30) => {
                    sleep(Duration::from_secs(30) - (Instant::now() - instant)).await
                }
                _ => (),
            };
            last_iteration_started_at = Some(Instant::now());

            match watcher
                .get_filter_changes::<_, ethers_core::types::H256>(filter_id)
                .await
            {
                Ok(_results) => {
                    err_count = 0;
                    let block_number = retry_fn(|| self.client.get_block_number())
                        .with_config(retry_config)
                        .await
                        .map_err(ContractError::MiddlewareError)?;

                    if let Some(last_block_number) = maybe_last_block_number {
                        if last_block_number == block_number.as_u64() {
                            trace!(last_block_number, "skipping previously seen block");
                            continue;
                        }
                    }

                    maybe_last_block_number = Some(block_number.as_u64());
                    match retry_fn(|| self.client.get_block(block_number))
                        .with_config(retry_config)
                        .await
                        .map_err(ContractError::MiddlewareError)?
                    {
                        Some(block) => {
                            let block_timestamp = block.timestamp.as_u64() as i64;
                            match SystemTime::now().duration_since(UNIX_EPOCH) {
                                Ok(current_time) => {
                                    info!(
                                        block_number = block_number.as_u64(),
                                        timestamp = block_timestamp,
                                        delay_seconds =
                                            current_time.as_secs() as i64 - block_timestamp,
                                        instance_name = self.instance_name.as_str(),
                                        "New block"
                                    );
                                }
                                Err(_) => {
                                    info!(
                                        block_number = block_number.as_u64(),
                                        timestamp = block_timestamp,
                                        instance_name = self.instance_name.as_str(),
                                        "New block"
                                    );
                                }
                            }
                        }
                        None => {
                            info!(
                                block_number = block_number.as_u64(),
                                instance_name = self.instance_name.as_str(),
                                "New block"
                            );
                        }
                    }

                    if block_number % 10 == 0.into() {
                        // on each new block we open a new file handler to dump our state.
                        // we should just have a database connection instead here...
                        file = Some(
                            std::fs::OpenOptions::new()
                                .read(true)
                                .write(true)
                                .create(true)
                                .open(&fname)
                                .unwrap(),
                        );
                    }

                    // run the logic for this block
                    match self.on_block(block_number).await {
                        Ok(_) => {
                            failures_in_row = 0;

                            // update our last block
                            self.last_block = block_number;

                            // Log once every 10 blocks
                            if let Some(file) = file.take() {
                                self.log(file);
                            }
                        }
                        Err(x) => {
                            warn!(err=?x, "Failed to process block");
                            maybe_last_block_number = None;
                            failures_in_row += 1;
                            if failures_in_row >= 10 {
                                return Err(x);
                            }
                            continue;
                        }
                    }
                }
                Err(_x) => {
                    err_count += 1;
                    if err_count == 10 {
                        return Err(ContractError::ProviderError(ProviderError::CustomError(
                            String::from("can't query filter"),
                        )));
                    }
                    filter_id = retry_fn(|| watcher.new_filter(FilterKind::NewBlocks))
                        .with_config(retry_config)
                        .await
                        .map_err(ContractError::MiddlewareError)?;
                }
            }
        }
    }

    #[instrument(skip(self), fields(self.instance_name))]
    pub async fn one_shot(&mut self) -> Result<(), M> {
        let block_number = self
            .client
            .get_block_number()
            .await
            .map_err(ContractError::MiddlewareError)?;
        return self.on_block(block_number).await;
    }

    /// Runs the liquidation business logic for the specified block
    #[instrument(skip(self), fields(self.instance_name))]
    async fn on_block(&mut self, block_number: U64) -> Result<(), M> {
        // Get the gas price - TODO: Replace with gas price oracle
        let gas_price = self
            .client
            .get_gas_price()
            .await
            .map_err(ContractError::MiddlewareError)?;

        // 1. Check if our transactions have been mined
        self.liquidator.remove_or_bump().await?;

        // 2. update our dataset with the new block's data
        self.borrowers
            .update_vaults(self.last_block, block_number, &mut self.cache)
            .await?;

        // 3. trigger the auction for any undercollateralized borrowers
        self.liquidator
            .start_auctions(self.borrowers.vaults.iter(), gas_price)
            .await?;

        // 4. try buying the ones which are worth buying
        self.liquidator
            .buy_opportunities(self.last_block, block_number, gas_price, &mut self.cache)
            .await?;
        Ok(())
    }

    fn log<W: Write>(&self, w: W) {
        serde_json::to_writer(
            w,
            &State {
                auctions: self.liquidator.auctions.clone(),
                vaults: self.borrowers.vaults.clone(),
                last_block: self.last_block.as_u64(),
            },
        )
        .unwrap();
    }
}

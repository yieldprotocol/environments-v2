//TODO: These numbers are kind of annoying to update, maybe we do away with them?
--- Libraries ---
deploy YieldMath
deploy YieldMathExtensions
deploy PoolView
deploy SafeERC20Namer

--- Governance ---
deploy Timelock
deploy Cloak
orchestrate Cloak

--- Oracles ---
deploy ChainlinkMultiOracle
deploy CompoundMultiOracle
deploy CompositeMultiOracle
deploy UniswapMultiOracle
deploy LidoOracle
deploy YearnOracle

orchestrate ChainlinkMultiOracle
orchestrate CompoundMultiOracle
orchestrate CompositeMultiOracle
orchestrate UniswapMultiOracle
orchestrate LidoOracle
orchestrate YearnOracle
update chi sources
update rate sources
update chainlink sources
update uniswap sources
update lido sources
update composite sources
update composite paths
update yearn sources

--- Factories ---
deploy JoinFactory
deploy FYTokenFactory
deploy PoolFactory
orchestrate JoinFactory
orchestrate FYTokenFactory
orchestrate PoolFactory

--- Core ---
deploy Cauldron
deploy Ladle
deploy Witch
deploy Wand

orchestrate Cauldron
orchestrate Ladle
orchestrate Witch
orchestrate Wand

--- Assets ---
add assets

orchestrate joins
make bases
make ilks

--- Series ---
deploy series
deploy strategies

orchestrate fyToken
orchestrate strategies
init pools
init strategies

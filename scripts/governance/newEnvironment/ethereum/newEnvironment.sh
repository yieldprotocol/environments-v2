--- Libraries ---
01. deploy YieldMath
02. deploy YieldMathExtensions
03. deploy PoolView
04. deploy SafeERC20Namer

--- Governance ---

05. deploy Timelock
06. deploy Cloak

07. orchestrate Cloak

--- Oracles ---
08. deploy ChainlinkMultiOracle
09. deploy CompoundMultiOracle
10. deploy CompositeMultiOracle
11. deploy UniswapMultiOracle
12. deploy LidoOracle

13. orchestrate ChainlinkMultiOracle
    orchestrate CompoundMultiOracle
    orchestrate CompositeMultiOracle
    orchestrate UniswapMultiOracle
    orchestrate LidoOracle
    update chi sources
    update rate sources
    update chainlink sources
    update uniswap sources
    update lido sources
    update composite sources
    update composite paths

--- Utils ---
deploy LidoWrapHandler

--- Core ---
deploy Cauldron
deploy Ladle
deploy Witch
deploy Wand

orchestrate Cauldron
orchestrate Ladle
orchestrate Witch
orchestrate Wand

--- Strategies ---
deploy strategies

--- Assets ---
add assets

orchestrate assets
make bases
make ilks

deploy series

orchestrate fyToken
init pools
init strategies

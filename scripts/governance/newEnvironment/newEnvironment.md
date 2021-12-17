//TODO: These numbers are kind of annoying to update, maybe we do away with them?
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
13. deploy YearnOracle

14. orchestrate ChainlinkMultiOracle
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
15. deploy JoinFactory
16. deploy FYTokenFactory
17. deploy PoolFactory
18. orchestrate JoinFactory
    orchestrate FYTokenFactory
    orchestrate PoolFactory

--- Core ---
19. deploy Cauldron
20. deploy Ladle
21. deploy Witch
22. deploy Wand

23. orchestrate Cauldron
    orchestrate Ladle
    orchestrate Witch
    orchestrate Wand

--- Assets ---
24. add assets

25. orchestrate joins
    make bases
    make ilks

--- Series ---
26. deploy series
27. deploy strategies

28. orchestrate fyToken
    orchestrate strategies
    init pools
    init strategies
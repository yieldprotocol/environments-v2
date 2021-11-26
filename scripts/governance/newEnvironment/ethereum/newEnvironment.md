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

--- Factories ---
14. deploy JoinFactory
15. deploy FYTokenFactory
16. deploy PoolFactory
17. orchestrate JoinFactory
    orchestrate FYTokenFactory
    orchestrate PoolFactory

--- Core ---
18. deploy Cauldron
19. deploy Ladle
20. deploy Witch
21. deploy Wand

22. orchestrate Cauldron
    orchestrate Ladle
    orchestrate Witch
    orchestrate Wand

--- Assets ---
23. add assets

24. orchestrate joins
    make bases
    make ilks

25. deploy series
26. deploy strategies

27. orchestrate fyToken
    orchestrate strategies
    init pools
    init strategies
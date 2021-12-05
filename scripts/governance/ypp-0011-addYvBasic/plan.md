This is mostly based on https://github.com/yieldprotocol/environments-v2/pull/48#issue-1043762341


 1. for wsteth we did a **chainlink mock**, I'm not clear exactly why we did that when we were mocking the steth/wsteth anyways, do I need to do that for yearn vaults?
 2. so I guess I should do **yvUsdc and yvDai mocks** for Rinkeby deployment?
 3. I'm not 100% sure yet if we will need **USDC and DAI mocks**?	I guess that would allow us to mint some tokens for testing on Rinkeby?
 4. [Reserve yvDai and yvUSDC asset ids](https://github.com/yieldprotocol/environments-v2/commit/d394a35ebb9ff642b474c2b65ce5f3c5fb092dfb)
 5. Deploy yvBasic oracle (for yvDai and yvUsdc)
 6. Configure permissions for yvBasic oracle
 7. Add yvUsdc/USDC and yvDai/DAI sources for yvBasic oracle
 8. If we use a chainlink oracle mock, we need to add sources
 9. Add new sources to Composite oracle
 10. Add new paths to Composite oracle [dai/yvUsdc,  dai/yvDai,  usdc/yvUsdc, usdc/yvDai] -- **what about x/eth paths**?
 11. Add yvUsdc and yvDai as assets
 12. Make yvUsdc and yvDai as ilks
 13. Approve yvUsdc and yvDai as collateral for all series
 14. ??? Write (test for mainnet)[https://github.com/yieldprotocol/environments-v2/pull/69/files]


Will I have this equivalent step or was this just for wstEth because of the wrapping?
```
Adds wstETH and stETH as tokens to Ladle, to allow `transfer` and `permit`
```

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/redeploy.goerli.config
RUN="npx hardhat run --network goerli"

$RUN $HERE/../../fragments/mocks/deployUSDC.ts
$RUN $HERE/../add/addCollateral/addYearnCollateral/yvUSDC/mocks/deployYVUSDCMock.ts
$RUN $HERE/../add/addCollateral/addCompositeCollateral/uniswap/mocks/deployENSMock.ts
$RUN $HERE/../add/addCollateral/addChainlinkCollateral/mocks/deployLINKMock.ts
$RUN $HERE/../add/addCollateral/addChainlinkCollateral/mocks/deployUNIMock.ts

$RUN $HERE/../add/addStEthConverter/mocks/deployStETHMock.ts
$RUN $HERE/../add/addStEthConverter/mocks/deployWstETHMock.ts
$RUN $HERE/../add/addStEthConverter/mocks/deployStETHAggregatorMock.ts

# FRAX
$RUN $HERE/../addSeries/addFraxSeries/mocks/deployFraxAggregatorMock.ts
$RUN $HERE/../addSeries/addFraxSeries/mocks/deployFraxMock.ts

$RUN $HERE/../../fragments/mocks/deployWETH9.ts
$RUN $HERE/../../fragments/mocks/deployDAI.ts
$RUN $HERE/../../fragments/mocks/deployWBTC.ts
$RUN $HERE/deployChainLinkAggregators.ts
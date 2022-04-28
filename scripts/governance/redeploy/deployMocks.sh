set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/redeploy.kovan.config
RUN="npx hardhat run --network localhost"

$RUN $HERE/../add/addCollateral/addYearnCollateral/yvUSDC/mocks/deployYVUSDCMock.ts
$RUN $HERE/../add/addWstEthConverter/mocks/deployWstETHMock.ts
$RUN $HERE/../add/addWstEthConverter/mocks/deployStETHMock.ts
$RUN $HERE/../add/addWstEthConverter/mocks/deployStETHAggregatorMock.ts
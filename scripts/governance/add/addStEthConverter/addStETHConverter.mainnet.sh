set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addStETHConverter.mainnet.config
RUN="npx hardhat run --network localhost"

$RUN $HERE/deployStETHConverter.ts &&
$RUN $HERE/addStETHConverter.ts &&
$RUN $HERE/addStETHConverter.ts &&
$RUN $HERE/addStETHConverter.ts
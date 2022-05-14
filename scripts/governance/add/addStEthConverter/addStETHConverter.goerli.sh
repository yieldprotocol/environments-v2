set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addStETHConverter.goerli.config
RUN="npx hardhat run --network goerli"

# $RUN $HERE/deployStETHConverter.ts
$RUN $HERE/addStETHConverter.ts
$RUN $HERE/addStETHConverter.ts
$RUN $HERE/addStETHConverter.ts
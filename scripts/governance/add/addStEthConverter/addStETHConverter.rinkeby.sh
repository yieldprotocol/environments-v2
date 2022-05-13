set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addStETHConverter.rinkeby.config
RUN="npx hardhat run --network rinkeby"

$RUN $HERE/deployStETHConverter.ts
$RUN $HERE/addStETHConverter.ts
$RUN $HERE/addStETHConverter.ts
$RUN $HERE/addStETHConverter.ts
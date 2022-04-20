set -eux
RUN="npx hardhat run --network rinkeby"
HERE=$(dirname $0)

$RUN $HERE/deployLidoWrapHandler.ts &&
$RUN $HERE/addStETHWrapper-2.ts &&
$RUN $HERE/addStETHWrapper-2.ts &&
$RUN $HERE/addStETHWrapper-2.ts
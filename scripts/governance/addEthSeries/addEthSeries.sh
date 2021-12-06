#!/bin/bash

set -eux
RUN="npx hardhat run --network rinkeby"
HERE=$(dirname $0)

$RUN $HERE/addEthSeries-1.ts
$RUN $HERE/addEthSeries-2.ts
$RUN $HERE/addEthSeries-2.ts
$RUN $HERE/addEthSeries-2.ts
$RUN $HERE/addEthSeries-3.ts
$RUN $HERE/addEthSeries-3.ts
$RUN $HERE/addEthSeries-3.ts
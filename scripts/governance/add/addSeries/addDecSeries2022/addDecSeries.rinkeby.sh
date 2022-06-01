#!/bin/bash

set -eux
RUN="npx hardhat run --network rinkeby"
HERE=$(dirname $0)

$RUN $HERE/addDecSeries-1.ts
$RUN $HERE/addDecSeries-2.ts

$RUN $HERE/loadTimelock.ts

$RUN $HERE/addDecSeries-3.ts
$RUN $HERE/addDecSeries-3.ts
$RUN $HERE/addDecSeries-3.ts
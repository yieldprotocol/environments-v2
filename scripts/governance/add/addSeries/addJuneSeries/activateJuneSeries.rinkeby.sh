#!/bin/bash

set -eux
RUN="npx hardhat run --network rinkeby"
HERE=$(dirname $0)

$RUN $HERE/addJuneSeries-3.ts
$RUN $HERE/addJuneSeries-3.ts
$RUN $HERE/addJuneSeries-3.ts
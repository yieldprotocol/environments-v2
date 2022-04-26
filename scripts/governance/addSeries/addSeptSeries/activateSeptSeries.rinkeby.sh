#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addSeptSeries.rinkeby.config
RUN="npx hardhat run --network rinkeby"

$RUN $HERE/addSeptSeries-3.ts
$RUN $HERE/addSeptSeries-3.ts
$RUN $HERE/addSeptSeries-3.ts
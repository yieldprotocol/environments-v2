#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addDecSeries.mainnet.config
RUN="npx hardhat run --network localhost"

$RUN $HERE/../addSeptSeries/addSeptSeries-3.ts
$RUN $HERE/../addSeptSeries/addSeptSeries-3.ts
$RUN $HERE/../addSeptSeries/addSeptSeries-3.ts
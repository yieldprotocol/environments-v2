#!/bin/bash

set -eux
export HERE=$(dirname $0)
RUN="npx hardhat run --network localhost"

# Phase 2: Orchestrate
export CONF=$PWD/$HERE/contango.config
$RUN $HERE/orchestrate.ts
$RUN $HERE/../../../../../shared/approve.ts
$RUN $HERE/../../../../../shared/execute.ts


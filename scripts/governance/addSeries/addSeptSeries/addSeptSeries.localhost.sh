#!/bin/bash

set -eux
RUN="npx hardhat run --network localhost"
HERE=$(dirname $0)

# Deploy fyTokens
$RUN $HERE/addSeptSeries-1.ts

# Deploy pools
$RUN $HERE/addSeptSeries-2.ts
$RUN $HERE/addSeptSeries-2.ts
$RUN $HERE/addSeptSeries-2.ts

# On localhost, put funds in the Timelock
$RUN $HERE/loadTimelock.ts

# On localhost, advance time
$RUN $HERE/advanceToMaturity.ts

# On localhost, loan to the joins if there is not enough for the redemption
$RUN $HERE/joinLoan.ts

# Setup and initialize series
$RUN $HERE/addSeptSeries-3.ts
$RUN $HERE/addSeptSeries-3.ts
$RUN $HERE/addSeptSeries-3.ts
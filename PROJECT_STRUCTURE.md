# Code structure

This repo is the crown jewel of Yield - it is the single integration point between all parts.

The challenge with multiple separate pieces is synchronization - every time a piece of code is touched,
the entire system upstream of it needs to be tested. That is hard to manage if each piece lives in a 
separate repository, so we take the monorepo approach

## Modules
These 'separate pieces of code' are called **modules**. Naturally, they live in `modules` directory.

Sample structure:
```
/contracts
/regression_tests
/scripts
/modules
 -/vaults
 -/liquidator
 -/shared
    -/mocks
```

Basic idea: modules can't depend on each other (only on 'shared' module). If something needs a cross-module
dependency (deployment scripts, regression tests), it lives at the top level, outside of `modules`. 

To add a dependency on a module, just symlink it. As a naming convention, we use "::" prefix for module dependencies:
```
❯❯❯ ls -al contracts
total 8
drwxr-xr-x   5 owleksiy  staff   160 Dec 21 23:55 .
drwxr-xr-x  32 owleksiy  staff  1024 Dec 21 23:55 ..
lrwxr-xr-x   1 owleksiy  staff    31 Dec 21 17:51 ::liquidator -> ../modules/liquidator/contracts
lrwxr-xr-x   1 owleksiy  staff    23 Dec 21 23:55 ::mocks -> ../modules/shared/mocks
-rw-r--r--   1 owleksiy  staff  1973 Dec 21 14:33 Importer.sol
```

## Tooling
You don't have to use any special tooling to work with modules - just use your normal `yarn`/`npm` workflows.

The only time you might care about extra tooling is when you want to run tests (or regression tests) on the **entire** project: run regression tests on `liquidator` and `environments-v2`

### Build all
```
❯❯❯ make -j build
```
This builds all modules and the main project, in parallel. 

### Test all
```
❯❯❯ make -j test
```
This runs tests on all modules and the main project, in parallel. 

### Regression test all
```
❯❯❯ make -j regressions
```
This runs regression tests in parallel. Regression tests are scripts in `regression_tests` directory with `test_` prefix.

## CI
CI will run 2 commands: `make test` to run all unit tests and `make regressions` to run all regression tests
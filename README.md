[![image](https://img.shields.io/npm/v/@mushroomsfi/keep3r-cli-job.svg?style=flat-square)](https://www.npmjs.org/package/@mushroomsfi/keep3r-cli-job)

# Mushrooms Finance CLI Job

This job enables The Keep3r Network keepers on Ethereum to execute tasks for Mushrooms yield-farming vaults (`earn`) and underlying strategies (`harvest`).

## How to install

1. Open a terminal inside your [CLI](https://github.com/keep3r-network/cli) setup
2. Run `yarn add @mushroomsfi/keep3r-cli-job`
3. Add job inside your CLI config file. It should look something like this:
```
{
    ...
    "jobs": [
        ...,
        {
            "path": "node_modules/@mushroomsfi/keep3r-cli-job/dist/src/mainnet/strategies"
        },
        {
            "path": "node_modules/@mushroomsfi/keep3r-cli-job/dist/src/mainnet/vaults"
        }
    ]
}
```

## Keeper Requirements

* Must be a valid Keeper on Keep3r V1

## Useful Links

* [Job](https://etherscan.io/address/0x0bd1d668d8e83d14252f2e01d5873df77a6511f0)
* [Documentation](https://github.com/keep3r-network/keep3r.network/pull/52)
* [Keep3r V1](https://etherscan.io/address/0x1ceb5cb57c4d4e2b2433641b95dd330a33185a44)
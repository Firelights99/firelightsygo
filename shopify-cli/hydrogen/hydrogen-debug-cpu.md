# hydrogen debug cpu

Builds the app and runs the resulting code to profile the server startup time, watching for changes. This command can be used to [debug slow app startup times](https://shopify.dev/docs/custom-storefronts/hydrogen/debugging/cpu-startup) that cause failed deployments in Oxygen.

  The profiling results are written to a `.cpuprofile` file that can be viewed with certain tools such as [Flame Chart Visualizer for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-js-profile-flame).

```bash
shopify hydrogen debug cpu [flags]
```

## Flags

The following flags are available for the `hydrogen debug cpu` command:

### hydrogendebugcpu

### --entry <value>

env: SHOPIFY_HYDROGEN_FLAG_ENTRY
value: `string`

Entry file for the worker. Defaults to `./server`.

### --output <value>

value: `string`

Specify a path to generate the profile file. Defaults to "startup.cpuprofile".

### --path <value>

env: SHOPIFY_HYDROGEN_FLAG_PATH
value: `string`

The path to the directory of the Hydrogen storefront. Defaults to the current directory where the command is run.


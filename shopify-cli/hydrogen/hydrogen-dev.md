# hydrogen dev

Runs a Hydrogen storefront in a local runtime that emulates an Oxygen worker for development.

  If your project is [linked](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-link) to a Hydrogen storefront, then its environment variables will be loaded with the runtime.

```bash
shopify hydrogen dev [flags]
```

## Flags

The following flags are available for the `hydrogen dev` command:

### hydrogendev

### --codegen

value: `""`

Automatically generates GraphQL types for your project’s Storefront API queries.

### --codegen-config-path <value>

value: `string`

Specifies a path to a codegen configuration file. Defaults to `<root>/codegen.ts` if this file exists.

### --debug

env: SHOPIFY_HYDROGEN_FLAG_DEBUG
value: `""`

Enables inspector connections to the server with a debugger such as Visual Studio Code or Chrome DevTools.

### --disable-deps-optimizer

env: SHOPIFY_HYDROGEN_FLAG_DISABLE_DEPS_OPTIMIZER
value: `""`

Disable adding dependencies to Vite's `ssr.optimizeDeps.include` automatically

### --disable-version-check

value: `""`

Skip the version check when running `hydrogen dev`

### --disable-virtual-routes

env: SHOPIFY_HYDROGEN_FLAG_DISABLE_VIRTUAL_ROUTES
value: `""`

Disable rendering fallback routes when a route file doesn't exist.

### --entry <value>

env: SHOPIFY_HYDROGEN_FLAG_ENTRY
value: `string`

Entry file for the worker. Defaults to `./server`.

### --env <value>

value: `string`

Specifies the environment to perform the operation using its handle. Fetch the handle using the `env list` command.

### --env-branch <value>

env: SHOPIFY_HYDROGEN_ENVIRONMENT_BRANCH
value: `string`

Specifies the environment to perform the operation using its Git branch name.

### --env-file <value>

value: `string`

Path to an environment file to override existing environment variables. Defaults to the '.env' located in your project path `--path`.

### --host

value: `""`

Expose the server to the local network

### --inspector-port <value>

env: SHOPIFY_HYDROGEN_FLAG_INSPECTOR_PORT
value: `string`

The port where the inspector is available. Defaults to 9229.

### --legacy-runtime

env: SHOPIFY_HYDROGEN_FLAG_LEGACY_RUNTIME
value: `""`

[Classic Remix Compiler] Runs the app in a Node.js sandbox instead of an Oxygen worker.

### --path <value>

env: SHOPIFY_HYDROGEN_FLAG_PATH
value: `string`

The path to the directory of the Hydrogen storefront. Defaults to the current directory where the command is run.

### --port <value>

env: SHOPIFY_HYDROGEN_FLAG_PORT
value: `string`

The port to run the server on. Defaults to 3000.

### --sourcemap

env: SHOPIFY_HYDROGEN_FLAG_SOURCEMAP
value: `""`

[Classic Remix Compiler] Controls whether server sourcemaps are generated. Default to `true`. Deactivate `--no-sourcemaps`.

### --verbose

env: SHOPIFY_HYDROGEN_FLAG_VERBOSE
value: `""`

Outputs more information about the command's execution.


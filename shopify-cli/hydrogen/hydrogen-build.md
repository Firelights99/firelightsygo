# hydrogen build

Builds a Hydrogen storefront for production. The client and app worker files are compiled to a `/dist` folder in your Hydrogen project directory.

```bash
shopify hydrogen build [flags]
```

## Flags

The following flags are available for the `hydrogen build` command:

### hydrogenbuild

### --bundle-stats

value: `""`

Show a bundle size summary after building. Defaults to true, use `--no-bundle-stats` to disable.

### --codegen

value: `""`

Automatically generates GraphQL types for your project’s Storefront API queries.

### --codegen-config-path <value>

value: `string`

Specifies a path to a codegen configuration file. Defaults to `<root>/codegen.ts` if this file exists.

### --disable-route-warning

env: SHOPIFY_HYDROGEN_FLAG_DISABLE_ROUTE_WARNING
value: `""`

Disables any warnings about missing standard routes.

### --entry <value>

env: SHOPIFY_HYDROGEN_FLAG_ENTRY
value: `string`

Entry file for the worker. Defaults to `./server`.

### --force-client-sourcemap

env: SHOPIFY_HYDROGEN_FLAG_FORCE_CLIENT_SOURCEMAP
value: `""`

Client sourcemapping is avoided by default because it makes backend code visible in the browser. Use this flag to force enabling it.

### --lockfile-check

env: SHOPIFY_HYDROGEN_FLAG_LOCKFILE_CHECK
value: `""`

Checks that there is exactly one valid lockfile in the project. Defaults to `true`. Deactivate with `--no-lockfile-check`.

### --path <value>

env: SHOPIFY_HYDROGEN_FLAG_PATH
value: `string`

The path to the directory of the Hydrogen storefront. Defaults to the current directory where the command is run.

### --sourcemap

env: SHOPIFY_HYDROGEN_FLAG_SOURCEMAP
value: `""`

Controls whether server sourcemaps are generated. Default to `true`. Deactivate `--no-sourcemaps`.

### --watch

env: SHOPIFY_HYDROGEN_FLAG_WATCH
value: `""`

Watches for changes and rebuilds the project writing output to disk.


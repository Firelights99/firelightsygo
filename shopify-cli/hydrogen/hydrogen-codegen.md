# hydrogen codegen

Automatically generates GraphQL types for your project’s Storefront API queries.

```bash
shopify hydrogen codegen [flags]
```

## Flags

The following flags are available for the `hydrogen codegen` command:

### hydrogencodegen

### --codegen-config-path <value>

value: `string`

Specify a path to a codegen configuration file. Defaults to `<root>/codegen.ts` if it exists.

### --path <value>

env: SHOPIFY_HYDROGEN_FLAG_PATH
value: `string`

The path to the directory of the Hydrogen storefront. Defaults to the current directory where the command is run.

### --watch

value: `""`

Watch the project for changes to update types on file save.


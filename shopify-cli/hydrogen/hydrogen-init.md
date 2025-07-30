# hydrogen init

Creates a new Hydrogen storefront.

```bash
shopify hydrogen init [flags]
```

## Flags

The following flags are available for the `hydrogen init` command:

### hydrogeninit

### --git

env: SHOPIFY_HYDROGEN_FLAG_GIT
value: `""`

Init Git and create initial commits.

### --install-deps

env: SHOPIFY_HYDROGEN_FLAG_INSTALL_DEPS
value: `""`

Auto installs dependencies using the active package manager.

### --language <value>

env: SHOPIFY_HYDROGEN_FLAG_LANGUAGE
value: `string`

Sets the template language to use. One of `js` or `ts`.

### --markets <value>

env: SHOPIFY_HYDROGEN_FLAG_I18N
value: `string`

Sets the URL structure to support multiple markets. Must be one of: `subfolders`, `domains`, `subdomains`, `none`. Example: `--markets subfolders`.

### --mock-shop

env: SHOPIFY_HYDROGEN_FLAG_MOCK_DATA
value: `""`

Use mock.shop as the data source for the storefront.

### --path <value>

env: SHOPIFY_HYDROGEN_FLAG_PATH
value: `string`

The path to the directory of the new Hydrogen storefront.

### --quickstart

env: SHOPIFY_HYDROGEN_FLAG_QUICKSTART
value: `""`

Scaffolds a new Hydrogen project with a set of sensible defaults. Equivalent to `shopify hydrogen init --path hydrogen-quickstart --mock-shop --language js --shortcut --routes --markets none`

### --routes

env: SHOPIFY_HYDROGEN_FLAG_ROUTES
value: `""`

Generate routes for all pages.

### --shortcut

env: SHOPIFY_HYDROGEN_FLAG_SHORTCUT
value: `""`

Creates a global h2 shortcut for Shopify CLI using shell aliases. Deactivate with `--no-shortcut`.

### --styling <value>

env: SHOPIFY_HYDROGEN_FLAG_STYLING
value: `string`

Sets the styling strategy to use. One of `tailwind`, `vanilla-extract`, `css-modules`, `postcss`, `none`.

### --template <value>

env: SHOPIFY_HYDROGEN_FLAG_TEMPLATE
value: `string`

Scaffolds project based on an existing template or example from the Hydrogen repository.

### -f, --force

env: SHOPIFY_HYDROGEN_FLAG_FORCE
value: `""`

Overwrites the destination directory and files if they already exist.


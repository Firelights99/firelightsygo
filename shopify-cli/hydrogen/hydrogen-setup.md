# hydrogen setup

Scaffold routes and core functionality.

```bash
shopify hydrogen setup [flags]
```

## Flags

The following flags are available for the `hydrogen setup` command:

### hydrogensetup

### --install-deps

env: SHOPIFY_HYDROGEN_FLAG_INSTALL_DEPS
value: `""`

Auto installs dependencies using the active package manager.

### --markets <value>

env: SHOPIFY_HYDROGEN_FLAG_I18N
value: `string`

Sets the URL structure to support multiple markets. Must be one of: `subfolders`, `domains`, `subdomains`, `none`. Example: `--markets subfolders`.

### --path <value>

env: SHOPIFY_HYDROGEN_FLAG_PATH
value: `string`

The path to the directory of the Hydrogen storefront. Defaults to the current directory where the command is run.

### --shortcut

env: SHOPIFY_HYDROGEN_FLAG_SHORTCUT
value: `""`

Creates a global h2 shortcut for Shopify CLI using shell aliases. Deactivate with `--no-shortcut`.

### -f, --force

env: SHOPIFY_HYDROGEN_FLAG_FORCE
value: `""`

Overwrites the destination directory and files if they already exist.


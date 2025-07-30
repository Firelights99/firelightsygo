# hydrogen upgrade

Upgrade Hydrogen project dependencies, preview features, fixes and breaking changes. The command also generates an instruction file for each upgrade.

```bash
shopify hydrogen upgrade [flags]
```

## Flags

The following flags are available for the `hydrogen upgrade` command:

### hydrogenupgrade

### --path <value>

env: SHOPIFY_HYDROGEN_FLAG_PATH
value: `string`

The path to the directory of the Hydrogen storefront. Defaults to the current directory where the command is run.

### -f, --force

env: SHOPIFY_HYDROGEN_FLAG_FORCE
value: `""`

Ignore warnings and force the upgrade to the target version

### -v, --version <value>

value: `string`

A target hydrogen version to update to


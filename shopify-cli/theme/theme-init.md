# theme init

Clones a Git repository to your local machine to use as the starting point for building a theme.

  If no Git repository is specified, then this command creates a copy of Shopify's [Skeleton theme](https://github.com/Shopify/skeleton-theme), with the specified name in the current folder. If no name is provided, then you're prompted to enter one.

  > Caution: If you're building a theme for the Shopify Theme Store, then you can use our example theme as a starting point. However, the theme that you submit needs to be [substantively different from existing themes](https://shopify.dev/docs/themes/store/requirements#uniqueness) so that it provides added value for users.
  

```bash
shopify theme init [name] [flags]
```

## Flags

The following flags are available for the `theme init` command:

### themeinit

### --no-color

env: SHOPIFY_FLAG_NO_COLOR
value: `""`

Disable color output.

### --path <value>

env: SHOPIFY_FLAG_PATH
value: `string`

The path where you want to run the command. Defaults to the current working directory.

### --verbose

env: SHOPIFY_FLAG_VERBOSE
value: `""`

Increase the verbosity of the output.

### -l, --latest

env: SHOPIFY_FLAG_LATEST
value: `""`

Downloads the latest release of the `clone-url`

### -u, --clone-url <value>

env: SHOPIFY_FLAG_CLONE_URL
value: `string`

The Git URL to clone from. Defaults to Shopify's Skeleton theme.


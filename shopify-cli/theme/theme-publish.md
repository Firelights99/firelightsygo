# theme publish

Publishes an unpublished theme from your theme library.

If no theme ID is specified, then you're prompted to select the theme that you want to publish from the list of themes in your store.

You can run this command only in a directory that matches the [default Shopify theme folder structure](https://shopify.dev/docs/themes/tools/cli#directory-structure).

If you want to publish your local theme, then you need to run `shopify theme push` first. You're asked to confirm that you want to publish the specified theme. You can skip this confirmation using the `--force` flag.

```bash
shopify theme publish [flags]
```

## Flags

The following flags are available for the `theme publish` command:

### themepublish

### --no-color

env: SHOPIFY_FLAG_NO_COLOR
value: `""`

Disable color output.

### --password <value>

env: SHOPIFY_CLI_THEME_TOKEN
value: `string`

Password generated from the Theme Access app.

### --path <value>

env: SHOPIFY_FLAG_PATH
value: `string`

The path where you want to run the command. Defaults to the current working directory.

### --verbose

env: SHOPIFY_FLAG_VERBOSE
value: `""`

Increase the verbosity of the output.

### -e, --environment <value>

env: SHOPIFY_FLAG_ENVIRONMENT
value: `string`

The environment to apply to the current command.

### -f, --force

env: SHOPIFY_FLAG_FORCE
value: `""`

Skip confirmation.

### -s, --store <value>

env: SHOPIFY_FLAG_STORE
value: `string`

Store URL. It can be the store prefix (example) or the full myshopify.com URL (example.myshopify.com, https://example.myshopify.com).

### -t, --theme <value>

env: SHOPIFY_FLAG_THEME_ID
value: `string`

Theme ID or name of the remote theme.


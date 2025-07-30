# theme metafields pull

Retrieves metafields from Shopify Admin.

If the metafields file already exists, it will be overwritten.

```bash
shopify theme metafields pull [flags]
```

## Flags

The following flags are available for the `theme metafields pull` command:

### thememetafieldspull

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

### -s, --store <value>

env: SHOPIFY_FLAG_STORE
value: `string`

Store URL. It can be the store prefix (example) or the full myshopify.com URL (example.myshopify.com, https://example.myshopify.com).


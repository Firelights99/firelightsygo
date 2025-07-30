# theme profile

Profile the Shopify Liquid on a given page.

  This command will open a web page with the Speedscope profiler detailing the time spent executing Liquid on the given page.

```bash
shopify theme profile

shopify theme profile --url /products/classic-leather-jacket
```

## Flags

The following flags are available for the `theme profile` command:

### themeprofile

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

### --store-password <value>

env: SHOPIFY_FLAG_STORE_PASSWORD
value: `string`

The password for storefronts with password protection.

### --url <value>

env: SHOPIFY_FLAG_URL
value: `string`

The url to be used as context

### --verbose

env: SHOPIFY_FLAG_VERBOSE
value: `""`

Increase the verbosity of the output.

### -e, --environment <value>

env: SHOPIFY_FLAG_ENVIRONMENT
value: `string`

The environment to apply to the current command.

### -j, --json

env: SHOPIFY_FLAG_JSON
value: `""`

Output the result as JSON.

### -s, --store <value>

env: SHOPIFY_FLAG_STORE
value: `string`

Store URL. It can be the store prefix (example) or the full myshopify.com URL (example.myshopify.com, https://example.myshopify.com).

### -t, --theme <value>

env: SHOPIFY_FLAG_THEME_ID
value: `string`

Theme ID or name of the remote theme.


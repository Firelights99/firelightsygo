# theme list

Lists the themes in your store, along with their IDs and statuses.

```bash
shopify theme list [flags]
```

## Flags

The following flags are available for the `theme list` command:

### themelist

### --id <value>

env: SHOPIFY_FLAG_ID
value: `string`

Only list theme with the given ID.

### --name <value>

env: SHOPIFY_FLAG_NAME
value: `string`

Only list themes that contain the given name.

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

### --role <value>

env: SHOPIFY_FLAG_ROLE
value: `string`

Only list themes with the given role.

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


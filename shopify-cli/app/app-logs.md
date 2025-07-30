# app logs


  Opens a real-time stream of detailed app logs from the selected app and store.
  Use the `--source` argument to limit output to a particular log source, such as a specific Shopify Function handle. Use the `shopify app logs sources` command to view a list of sources.
  Use the `--status` argument to filter on status, either `success` or `failure`.
  ```
  shopify app logs --status=success --source=extension.discount-function
  ```
  

```bash
shopify app logs [flags]
```

## Flags

The following flags are available for the `app logs` command:

### applogs

### --client-id <value>

env: SHOPIFY_FLAG_CLIENT_ID
value: `string`

The Client ID of your app.

### --no-color

env: SHOPIFY_FLAG_NO_COLOR
value: `""`

Disable color output.

### --path <value>

env: SHOPIFY_FLAG_PATH
value: `string`

The path to your app directory.

### --reset

env: SHOPIFY_FLAG_RESET
value: `""`

Reset all your settings.

### --source <value>

env: SHOPIFY_FLAG_SOURCE
value: `string`

Filters output to the specified log source.

### --status <value>

env: SHOPIFY_FLAG_STATUS
value: `string`

Filters output to the specified status (success or failure).

### --verbose

env: SHOPIFY_FLAG_VERBOSE
value: `""`

Increase the verbosity of the output.

### -c, --config <value>

env: SHOPIFY_FLAG_APP_CONFIG
value: `string`

The name of the app configuration.

### -j, --json

env: SHOPIFY_FLAG_JSON
value: `""`

Output the result as JSON.

### -s, --store <value>

env: SHOPIFY_FLAG_STORE
value: `string`

Store URL. Must be an existing development or Shopify Plus sandbox store.


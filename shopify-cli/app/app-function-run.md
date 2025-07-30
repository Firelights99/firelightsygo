# app function run

Runs the function from your current directory for [testing purposes](https://shopify.dev/docs/apps/functions/testing-and-debugging). To learn how you can monitor and debug functions when errors occur, refer to [Shopify Functions error handling](https://shopify.dev/docs/api/functions/errors).

```bash
shopify app function run [flags]
```

## Flags

The following flags are available for the `app function run` command:

### appfunctionrun

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

The path to your function directory.

### --reset

env: SHOPIFY_FLAG_RESET
value: `""`

Reset all your settings.

### --verbose

env: SHOPIFY_FLAG_VERBOSE
value: `""`

Increase the verbosity of the output.

### -c, --config <value>

env: SHOPIFY_FLAG_APP_CONFIG
value: `string`

The name of the app configuration.

### -e, --export <value>

env: SHOPIFY_FLAG_EXPORT
value: `string`

Name of the WebAssembly export to invoke.

### -i, --input <value>

env: SHOPIFY_FLAG_INPUT
value: `string`

The input JSON to pass to the function. If omitted, standard input is used.

### -j, --json

env: SHOPIFY_FLAG_JSON
value: `""`

Output the result as JSON.


# app function replay

Runs the function from your current directory for [testing purposes](https://shopify.dev/docs/apps/functions/testing-and-debugging). To learn how you can monitor and debug functions when errors occur, refer to [Shopify Functions error handling](https://shopify.dev/docs/api/functions/errors).

```bash
shopify app function replay [flags]
```

## Flags

The following flags are available for the `app function replay` command:

### appfunctionreplay

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

### -j, --json

env: SHOPIFY_FLAG_JSON
value: `""`

Output the result as JSON.

### -l, --log <value>

env: SHOPIFY_FLAG_LOG
value: `string`

Specifies a log identifier to replay instead of selecting from a list. The identifier is provided in the output of `shopify app dev` and is the suffix of the log file name.

### -w, --watch

env: SHOPIFY_FLAG_WATCH
value: `""`

Re-run the function when the source code changes.


# app info

The information returned includes the following:

  - The app and development store or Plus sandbox store that's used when you run the [dev](https://shopify.dev/docs/api/shopify-cli/app/app-dev) command. You can reset these configurations using [`dev --reset`](https://shopify.dev/docs/api/shopify-cli/app/app-dev#flags-propertydetail-reset).
  - The [structure](https://shopify.dev/docs/apps/tools/cli/structure) of your app project.
  - The [access scopes](https://shopify.dev/docs/api/usage) your app has requested.
  - System information, including the package manager and version of Shopify CLI used in the project.

```bash
shopify app info [flags]
```

## Flags

The following flags are available for the `app info` command:

### appinfo

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

### --verbose

env: SHOPIFY_FLAG_VERBOSE
value: `""`

Increase the verbosity of the output.

### --web-env

env: SHOPIFY_FLAG_OUTPUT_WEB_ENV
value: `""`

Outputs environment variables necessary for running and deploying web/.

### -c, --config <value>

env: SHOPIFY_FLAG_APP_CONFIG
value: `string`

The name of the app configuration.

### -j, --json

env: SHOPIFY_FLAG_JSON
value: `""`

Output the result as JSON.


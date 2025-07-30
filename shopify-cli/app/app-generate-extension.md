# app generate extension

Generates a new [app extension](https://shopify.dev/docs/apps/app-extensions). For a list of app extensions that you can generate using this command, refer to [Supported extensions](https://shopify.dev/docs/apps/structure/app-extensions/list).

  Each new app extension is created in a folder under `extensions/`. To learn more about the extensions file structure, refer to [App structure](https://shopify.dev/docs/apps/tools/cli/structure) and the documentation for your extension.
  

```bash
shopify app generate extension [flags]
```

## Flags

The following flags are available for the `app generate extension` command:

### appgenerateextension

### --client-id <value>

env: SHOPIFY_FLAG_CLIENT_ID
value: `string`

The Client ID of your app.

### --flavor <value>

env: SHOPIFY_FLAG_FLAVOR
value: `string`

Choose a starting template for your extension, where applicable

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

### -c, --config <value>

env: SHOPIFY_FLAG_APP_CONFIG
value: `string`

The name of the app configuration.

### -n, --name <value>

env: SHOPIFY_FLAG_NAME
value: `string`

name of your Extension

### -t, --template <value>

env: SHOPIFY_FLAG_EXTENSION_TEMPLATE
value: `string`

Extension template

### -t, --type <value>

env: SHOPIFY_FLAG_EXTENSION_TYPE
value: `string`

Deprecated. Please use --template


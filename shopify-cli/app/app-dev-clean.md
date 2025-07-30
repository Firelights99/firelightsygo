# app dev clean

Stop the app preview that was started with `shopify app dev`.

  It restores the app's active version to the selected development store.

  It's valid only for apps created on the Next-Gen Dev Platform.
  

```bash
shopify app dev clean [flags]
```

## Flags

The following flags are available for the `app dev clean` command:

### appdevclean

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

### -c, --config <value>

env: SHOPIFY_FLAG_APP_CONFIG
value: `string`

The name of the app configuration.

### -s, --store <value>

env: SHOPIFY_FLAG_STORE
value: `string`

Store URL. Must be an existing development store.


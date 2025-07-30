# app config use

Sets default configuration when you run app-related CLI commands. If you omit the `config-name` parameter, then you'll be prompted to choose from the configuration files in your project.

```bash
shopify app config use [config] [flags]
```

## Flags

The following flags are available for the `app config use` command:

### appconfiguse

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


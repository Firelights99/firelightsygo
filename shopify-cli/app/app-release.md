# app release

Releases an existing app version. Pass the name of the version that you want to release using the `--version` flag.

```bash
shopify app release --version <version>
```

## Flags

The following flags are available for the `app release` command:

### apprelease

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

### --version <value>

env: SHOPIFY_FLAG_VERSION
value: `string`

The name of the app version to release.

### -c, --config <value>

env: SHOPIFY_FLAG_APP_CONFIG
value: `string`

The name of the app configuration.

### -f, --force

env: SHOPIFY_FLAG_FORCE
value: `""`

Release without asking for confirmation.


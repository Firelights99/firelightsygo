# app env pull

Creates or updates an `.env` files that contains app and app extension environment variables.

  When an existing `.env` file is updated, changes to the variables are displayed in the terminal output. Existing variables and commented variables are preserved.

```bash
shopify app env pull [flags]
```

## Flags

The following flags are available for the `app env pull` command:

### appenvpull

### --client-id <value>

env: SHOPIFY_FLAG_CLIENT_ID
value: `string`

The Client ID of your app.

### --env-file <value>

env: SHOPIFY_FLAG_ENV_FILE
value: `string`

Specify an environment file to update if the update flag is set

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


# app function schema

Generates the latest [GraphQL schema](https://shopify.dev/docs/apps/functions/input-output#graphql-schema) for a function in your app. Run this command from the function directory.

  This command uses the API type and version of your function, as defined in your extension TOML file, to generate the latest GraphQL schema. The schema is written to the `schema.graphql` file.

```bash
shopify app function schema [flags]
```

## Flags

The following flags are available for the `app function schema` command:

### appfunctionschema

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

### --stdout

env: SHOPIFY_FLAG_STDOUT
value: `""`

Output the schema to stdout instead of writing to a file.

### --verbose

env: SHOPIFY_FLAG_VERBOSE
value: `""`

Increase the verbosity of the output.

### -c, --config <value>

env: SHOPIFY_FLAG_APP_CONFIG
value: `string`

The name of the app configuration.


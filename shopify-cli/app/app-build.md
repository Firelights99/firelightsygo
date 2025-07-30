# app build

This command executes the build script specified in the element's TOML file. You can specify a custom script in the file. To learn about configuration files in Shopify apps, refer to [App configuration](https://shopify.dev/docs/apps/tools/cli/configuration).

  If you're building a [theme app extension](https://shopify.dev/docs/apps/online-store/theme-app-extensions), then running the `build` command runs [Theme Check](https://shopify.dev/docs/themes/tools/theme-check) against your extension to ensure that it's valid.

```bash
shopify app build [flags]
```

## Flags

The following flags are available for the `app build` command:

### appbuild

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

### --skip-dependencies-installation

env: SHOPIFY_FLAG_SKIP_DEPENDENCIES_INSTALLATION
value: `""`

Skips the installation of dependencies. Deprecated, use workspaces instead.

### --verbose

env: SHOPIFY_FLAG_VERBOSE
value: `""`

Increase the verbosity of the output.

### -c, --config <value>

env: SHOPIFY_FLAG_APP_CONFIG
value: `string`

The name of the app configuration.


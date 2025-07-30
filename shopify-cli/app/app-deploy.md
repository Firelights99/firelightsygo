# app deploy

[Builds the app](https://shopify.dev/docs/api/shopify-cli/app/app-build), then deploys your app configuration and extensions.

  This command creates an app version, which is a snapshot of your app configuration and all extensions, including the app extensions that you manage in the Partner Dashboard. This version is then released to users.

  This command doesn't deploy your [web app](https://shopify.dev/docs/apps/tools/cli/structure#web-components). You need to [deploy your web app](https://shopify.dev/docs/apps/deployment/web) to your own hosting solution.
  

```bash
shopify app deploy [flags]
```

## Flags

The following flags are available for the `app deploy` command:

### appdeploy

### --client-id <value>

env: SHOPIFY_FLAG_CLIENT_ID
value: `string`

The Client ID of your app.

### --message <value>

env: SHOPIFY_FLAG_MESSAGE
value: `string`

Optional message that will be associated with this version. This is for internal use only and won't be available externally.

### --no-build

env: SHOPIFY_FLAG_NO_BUILD
value: `""`

Use with caution: Skips building any elements of the app that require building. You should ensure your app has been prepared in advance, such as by running `shopify app build` or by caching build artifacts.

### --no-color

env: SHOPIFY_FLAG_NO_COLOR
value: `""`

Disable color output.

### --no-release

env: SHOPIFY_FLAG_NO_RELEASE
value: `""`

Creates a version but doesn't release it - it's not made available to merchants.

### --path <value>

env: SHOPIFY_FLAG_PATH
value: `string`

The path to your app directory.

### --reset

env: SHOPIFY_FLAG_RESET
value: `""`

Reset all your settings.

### --source-control-url <value>

env: SHOPIFY_FLAG_SOURCE_CONTROL_URL
value: `string`

URL associated with the new app version.

### --verbose

env: SHOPIFY_FLAG_VERBOSE
value: `""`

Increase the verbosity of the output.

### --version <value>

env: SHOPIFY_FLAG_VERSION
value: `string`

Optional version tag that will be associated with this app version. If not provided, an auto-generated identifier will be generated for this app version.

### -c, --config <value>

env: SHOPIFY_FLAG_APP_CONFIG
value: `string`

The name of the app configuration.

### -f, --force

env: SHOPIFY_FLAG_FORCE
value: `""`

Deploy without asking for confirmation.


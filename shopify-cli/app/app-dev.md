# app dev

[Builds the app](https://shopify.dev/docs/api/shopify-cli/app/app-build) and lets you preview it on a [development store](https://shopify.dev/docs/apps/tools/development-stores) or [Plus sandbox store](https://help.shopify.com/partners/dashboard/managing-stores/plus-sandbox-store).

> Note: Development store preview of extension drafts is not supported for Plus sandbox stores. You must `deploy` your app.

  To preview your app on a development store or Plus sandbox store, Shopify CLI walks you through the following steps. If you've run `dev` before, then your settings are saved and some of these steps are skipped. You can reset these configurations using `dev --reset` to go through all of them again:

- Associating your project with an app associated with your Partner account or organization, or creating a new app.
- Selecting a development store or Plus sandbox store to use for testing. If you have only one store, then it's selected automatically.
- Installing your app on the store using the provided install link.
- Creating a tunnel between your local environment and the store using Cloudflare.

  You can use your own tunneling software instead, by passing your tunnel URL with the `--tunnel-url` flag.
- Updating the app URLs that are set in the Partner Dashboard.

  To avoid overwriting any URLs that are already set, select the No, never option. If you select this option, then you're provided with URLs that you can manually add in the Partner Dashboard so you can preview your app.

- Enabling development store preview for extensions.
- Serving [GraphiQL for the Admin API](https://shopify.dev/docs/apps/tools/graphiql-admin-api#use-a-local-graphiql-instance) using your app's credentials and access scopes.
- Building and serving your app and app extensions.

If you're using the Ruby app template, then you need to complete the following steps outlined in the [README](https://github.com/Shopify/shopify-app-template-ruby#setting-up-your-rails-app) before you can preview your app for the first time.

> Caution: To use a development store or Plus sandbox store with Shopify CLI, you need to be the store owner, or have a [staff account](https://help.shopify.com/manual/your-account/staff-accounts) on the store. Staff accounts are created automatically the first time you access a development store with your Partner staff account through the Partner Dashboard.


```bash
shopify app dev [flags]
```

## Flags

The following flags are available for the `app dev` command:

### appdev

### --checkout-cart-url <value>

env: SHOPIFY_FLAG_CHECKOUT_CART_URL
value: `string`

Resource URL for checkout UI extension. Format: "/cart/{productVariantID}:{productQuantity}"

### --client-id <value>

env: SHOPIFY_FLAG_CLIENT_ID
value: `string`

The Client ID of your app.

### --localhost-port <value>

env: SHOPIFY_FLAG_LOCALHOST_PORT
value: `string`

Port to use for localhost.

### --no-color

env: SHOPIFY_FLAG_NO_COLOR
value: `""`

Disable color output.

### --no-update

env: SHOPIFY_FLAG_NO_UPDATE
value: `""`

Skips the Partners Dashboard URL update step.

### --notify <value>

env: SHOPIFY_FLAG_NOTIFY
value: `string`

The file path or URL. The file path is to a file that you want updated on idle. The URL path is where you want a webhook posted to report on file changes.

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

### --subscription-product-url <value>

env: SHOPIFY_FLAG_SUBSCRIPTION_PRODUCT_URL
value: `string`

Resource URL for subscription UI extension. Format: "/products/{productId}"

### --theme-app-extension-port <value>

env: SHOPIFY_FLAG_THEME_APP_EXTENSION_PORT
value: `string`

Local port of the theme app extension development server.

### --tunnel-url <value>

env: SHOPIFY_FLAG_TUNNEL_URL
value: `string`

Use a custom tunnel, it must be running before executing dev. Format: "https://my-tunnel-url:port".

### --use-localhost

env: SHOPIFY_FLAG_USE_LOCALHOST
value: `""`

Service entry point will listen to localhost. A tunnel won't be used. Will work for testing many app features, but not those that directly invoke your app (E.g: Webhooks)

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

Store URL. Must be an existing development or Shopify Plus sandbox store.

### -t, --theme <value>

env: SHOPIFY_FLAG_THEME
value: `string`

Theme ID or name of the theme app extension host theme.


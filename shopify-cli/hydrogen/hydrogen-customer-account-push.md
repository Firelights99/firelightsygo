# hydrogen customer-account-push

Push project configuration to admin

```bash
shopify hydrogen customer-account-push [flags]
```

## Flags

The following flags are available for the `hydrogen customer-account-push` command:

### hydrogencustomeraccountpush

### --dev-origin <value>

value: `string`

The development domain of your application.

### --path <value>

env: SHOPIFY_HYDROGEN_FLAG_PATH
value: `string`

The path to the directory of the Hydrogen storefront. Defaults to the current directory where the command is run.

### --relative-logout-uri <value>

value: `string`

The relative url of allowed url that will be redirected to post-logout for Customer Account API OAuth flow. Default to nothing.

### --relative-redirect-uri <value>

value: `string`

The relative url of allowed callback url for Customer Account API OAuth flow. Default is '/account/authorize'

### --storefront-id <value>

value: `string`

The id of the storefront the configuration should be pushed to. Must start with 'gid://shopify/HydrogenStorefront/'


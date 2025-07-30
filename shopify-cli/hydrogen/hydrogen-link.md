# hydrogen link

Links your local development environment to a remote Hydrogen storefront. You can link an unlimited number of development environments to a single Hydrogen storefront.

  Linking to a Hydrogen storefront enables you to run [dev](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-dev) and automatically inject your linked Hydrogen storefront's environment variables directly into the server runtime.

  After you run the `link` command, you can access the [env list](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-env-list), [env pull](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-env-pull), and [unlink](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-unlink) commands.

```bash
shopify hydrogen link [flags]
```

## Flags

The following flags are available for the `hydrogen link` command:

### hydrogenlink

### --path <value>

env: SHOPIFY_HYDROGEN_FLAG_PATH
value: `string`

The path to the directory of the Hydrogen storefront. Defaults to the current directory where the command is run.

### --storefront <value>

env: SHOPIFY_HYDROGEN_STOREFRONT
value: `string`

The name of a Hydrogen Storefront (e.g. "Jane's Apparel")

### -f, --force

env: SHOPIFY_HYDROGEN_FLAG_FORCE
value: `""`

Overwrites the destination directory and files if they already exist.


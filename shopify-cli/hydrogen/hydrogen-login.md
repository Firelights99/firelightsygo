# hydrogen login

Logs in to the specified shop and saves the shop domain to the project.

```bash
shopify hydrogen login [flags]
```

## Flags

The following flags are available for the `hydrogen login` command:

### hydrogenlogin

### --path <value>

env: SHOPIFY_HYDROGEN_FLAG_PATH
value: `string`

The path to the directory of the Hydrogen storefront. Defaults to the current directory where the command is run.

### -s, --shop <value>

env: SHOPIFY_SHOP
value: `string`

Shop URL. It can be the shop prefix (janes-apparel) or the full myshopify.com URL (janes-apparel.myshopify.com, https://janes-apparel.myshopify.com).


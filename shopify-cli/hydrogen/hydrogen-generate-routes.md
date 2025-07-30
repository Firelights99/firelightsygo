# hydrogen generate routes

Generates all supported standard shopify routes.

```bash
shopify hydrogen generate routes [flags]
```

## Flags

The following flags are available for the `hydrogen generate routes` command:

### hydrogengenerateroutes

### --adapter <value>

env: SHOPIFY_HYDROGEN_FLAG_ADAPTER
value: `string`

Remix adapter used in the route. The default is `@shopify/remix-oxygen`.

### --locale-param <value>

env: SHOPIFY_HYDROGEN_FLAG_ADAPTER
value: `string`

The param name in Remix routes for the i18n locale, if any. Example: `locale` becomes ($locale).

### --path <value>

env: SHOPIFY_HYDROGEN_FLAG_PATH
value: `string`

The path to the directory of the Hydrogen storefront. Defaults to the current directory where the command is run.

### --typescript

env: SHOPIFY_HYDROGEN_FLAG_TYPESCRIPT
value: `""`

Generate TypeScript files

### -f, --force

env: SHOPIFY_HYDROGEN_FLAG_FORCE
value: `""`

Overwrites the destination directory and files if they already exist.


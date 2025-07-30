# theme pull

Retrieves theme files from Shopify.

If no theme is specified, then you're prompted to select the theme to pull from the list of the themes in your store.

```bash
shopify theme pull [flags]
```

## Flags

The following flags are available for the `theme pull` command:

### themepull

### --no-color

env: SHOPIFY_FLAG_NO_COLOR
value: `""`

Disable color output.

### --password <value>

env: SHOPIFY_CLI_THEME_TOKEN
value: `string`

Password generated from the Theme Access app.

### --path <value>

env: SHOPIFY_FLAG_PATH
value: `string`

The path where you want to run the command. Defaults to the current working directory.

### --verbose

env: SHOPIFY_FLAG_VERBOSE
value: `""`

Increase the verbosity of the output.

### -d, --development

env: SHOPIFY_FLAG_DEVELOPMENT
value: `""`

Pull theme files from your remote development theme.

### -e, --environment <value>

env: SHOPIFY_FLAG_ENVIRONMENT
value: `string`

The environment to apply to the current command.

### -l, --live

env: SHOPIFY_FLAG_LIVE
value: `""`

Pull theme files from your remote live theme.

### -n, --nodelete

env: SHOPIFY_FLAG_NODELETE
value: `""`

Prevent deleting local files that don't exist remotely.

### -o, --only <value>

env: SHOPIFY_FLAG_ONLY
value: `string`

Download only the specified files (Multiple flags allowed).

### -s, --store <value>

env: SHOPIFY_FLAG_STORE
value: `string`

Store URL. It can be the store prefix (example) or the full myshopify.com URL (example.myshopify.com, https://example.myshopify.com).

### -t, --theme <value>

env: SHOPIFY_FLAG_THEME_ID
value: `string`

Theme ID or name of the remote theme.

### -x, --ignore <value>

env: SHOPIFY_FLAG_IGNORE
value: `string`

Skip downloading the specified files (Multiple flags allowed).


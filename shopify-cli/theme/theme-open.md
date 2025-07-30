# theme open

Returns links that let you preview the specified theme. The following links are returned:

  - A link to the [editor](https://shopify.dev/docs/themes/tools/online-editor) for the theme in the Shopify admin.
  - A [preview link](https://help.shopify.com/manual/online-store/themes/adding-themes#share-a-theme-preview-with-others) that you can share with other developers.

  If you don't specify a theme, then you're prompted to select the theme to open from the list of the themes in your store.

```bash
shopify theme open [flags]
```

## Flags

The following flags are available for the `theme open` command:

### themeopen

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

Open your development theme.

### -E, --editor

env: SHOPIFY_FLAG_EDITOR
value: `""`

Open the theme editor for the specified theme in the browser.

### -e, --environment <value>

env: SHOPIFY_FLAG_ENVIRONMENT
value: `string`

The environment to apply to the current command.

### -l, --live

env: SHOPIFY_FLAG_LIVE
value: `""`

Open your live (published) theme.

### -s, --store <value>

env: SHOPIFY_FLAG_STORE
value: `string`

Store URL. It can be the store prefix (example) or the full myshopify.com URL (example.myshopify.com, https://example.myshopify.com).

### -t, --theme <value>

env: SHOPIFY_FLAG_THEME_ID
value: `string`

Theme ID or name of the remote theme.


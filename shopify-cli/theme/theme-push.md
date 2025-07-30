# theme push

Uploads your local theme files to Shopify, overwriting the remote version if specified.

  If no theme is specified, then you're prompted to select the theme to overwrite from the list of the themes in your store.

  You can run this command only in a directory that matches the [default Shopify theme folder structure](https://shopify.dev/docs/themes/tools/cli#directory-structure).

  This command returns the following information:

  - A link to the [editor](https://shopify.dev/docs/themes/tools/online-editor) for the theme in the Shopify admin.
  - A [preview link](https://help.shopify.com/manual/online-store/themes/adding-themes#share-a-theme-preview-with-others) that you can share with others.

  If you use the `--json` flag, then theme information is returned in JSON format, which can be used as a machine-readable input for scripts or continuous integration.

  Sample output:

  ```json
  {
    "theme": {
      "id": 108267175958,
      "name": "MyTheme",
      "role": "unpublished",
      "shop": "mystore.myshopify.com",
      "editor_url": "https://mystore.myshopify.com/admin/themes/108267175958/editor",
      "preview_url": "https://mystore.myshopify.com/?preview_theme_id=108267175958"
    }
  }
  ```
    

```bash
shopify theme push

shopify theme push --unpublished --json
```

## Flags

The following flags are available for the `theme push` command:

### themepush

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

### --strict

env: SHOPIFY_FLAG_STRICT_PUSH
value: `""`

Require theme check to pass without errors before pushing. Warnings are allowed.

### --verbose

env: SHOPIFY_FLAG_VERBOSE
value: `""`

Increase the verbosity of the output.

### -a, --allow-live

env: SHOPIFY_FLAG_ALLOW_LIVE
value: `""`

Allow push to a live theme.

### -d, --development

env: SHOPIFY_FLAG_DEVELOPMENT
value: `""`

Push theme files from your remote development theme.

### -e, --environment <value>

env: SHOPIFY_FLAG_ENVIRONMENT
value: `string`

The environment to apply to the current command.

### -j, --json

env: SHOPIFY_FLAG_JSON
value: `""`

Output the result as JSON.

### -l, --live

env: SHOPIFY_FLAG_LIVE
value: `""`

Push theme files from your remote live theme.

### -n, --nodelete

env: SHOPIFY_FLAG_NODELETE
value: `""`

Prevent deleting remote files that don't exist locally.

### -o, --only <value>

env: SHOPIFY_FLAG_ONLY
value: `string`

Push only the specified files (Multiple flags allowed).

### -p, --publish

env: SHOPIFY_FLAG_PUBLISH
value: `""`

Publish as the live theme after uploading.

### -s, --store <value>

env: SHOPIFY_FLAG_STORE
value: `string`

Store URL. It can be the store prefix (example) or the full myshopify.com URL (example.myshopify.com, https://example.myshopify.com).

### -t, --theme <value>

env: SHOPIFY_FLAG_THEME_ID
value: `string`

Theme ID or name of the remote theme.

### -u, --unpublished

env: SHOPIFY_FLAG_UNPUBLISHED
value: `""`

Create a new unpublished theme and push to it.

### -x, --ignore <value>

env: SHOPIFY_FLAG_IGNORE
value: `string`

Skip uploading the specified files (Multiple flags allowed).


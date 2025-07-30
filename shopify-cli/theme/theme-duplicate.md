# theme duplicate

If you want to duplicate your local theme, you need to run `shopify theme push` first.

If no theme ID is specified, you're prompted to select the theme that you want to duplicate from the list of themes in your store. You're asked to confirm that you want to duplicate the specified theme.

Prompts and confirmations are not shown when duplicate is run in a CI environment or the `--force` flag is used, therefore you must specify a theme ID using the `--theme` flag.

You can optionally name the duplicated theme using the `--name` flag.

If you use the `--json` flag, then theme information is returned in JSON format, which can be used as a machine-readable input for scripts or continuous integration.

Sample JSON output:

```json
{
  "theme": {
    "id": 108267175958,
    "name": "A Duplicated Theme",
    "role": "unpublished",
    "shop": "mystore.myshopify.com"
  }
}
```

```json
{
  "message": "The theme 'Summer Edition' could not be duplicated due to errors",
  "errors": ["Maximum number of themes reached"],
  "requestId": "12345-abcde-67890"
}
```

```bash
shopify theme duplicate

shopify theme duplicate --theme 10 --name 'New Theme'
```

## Flags

The following flags are available for the `theme duplicate` command:

### themeduplicate

### --no-color

env: SHOPIFY_FLAG_NO_COLOR
value: `""`

Disable color output.

### --password <value>

env: SHOPIFY_CLI_THEME_TOKEN
value: `string`

Password generated from the Theme Access app.

### --verbose

env: SHOPIFY_FLAG_VERBOSE
value: `""`

Increase the verbosity of the output.

### -e, --environment <value>

env: SHOPIFY_FLAG_ENVIRONMENT
value: `string`

The environment to apply to the current command.

### -f, --force

env: SHOPIFY_FLAG_FORCE
value: `""`

Force the duplicate operation to run without prompts or confirmations.

### -j, --json

env: SHOPIFY_FLAG_JSON
value: `""`

Output the result as JSON.

### -n, --name <value>

env: SHOPIFY_FLAG_NAME
value: `string`

Name of the newly duplicated theme.

### -s, --store <value>

env: SHOPIFY_FLAG_STORE
value: `string`

Store URL. It can be the store prefix (example) or the full myshopify.com URL (example.myshopify.com, https://example.myshopify.com).

### -t, --theme <value>

env: SHOPIFY_FLAG_THEME_ID
value: `string`

Theme ID or name of the remote theme.


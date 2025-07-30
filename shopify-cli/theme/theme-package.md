# theme package

Packages your local theme files into a ZIP file that can be uploaded to Shopify.

  Only folders that match the [default Shopify theme folder structure](https://shopify.dev/docs/storefronts/themes/tools/cli#directory-structure) are included in the package.

  The package includes the `listings` directory if present (required for multi-preset themes per [Theme Store requirements](https://shopify.dev/docs/storefronts/themes/store/requirements#adding-presets-to-your-theme-zip-submission)).

  The ZIP file uses the name `theme_name-theme_version.zip`, based on parameters in your [settings_schema.json](https://shopify.dev/docs/storefronts/themes/architecture/config/settings-schema-json) file.

```bash
shopify theme package [flags]
```

## Flags

The following flags are available for the `theme package` command:

### themepackage

### --no-color

env: SHOPIFY_FLAG_NO_COLOR
value: `""`

Disable color output.

### --path <value>

env: SHOPIFY_FLAG_PATH
value: `string`

The path where you want to run the command. Defaults to the current working directory.

### --verbose

env: SHOPIFY_FLAG_VERBOSE
value: `""`

Increase the verbosity of the output.


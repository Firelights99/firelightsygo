# theme check

Calls and runs [Theme Check](https://shopify.dev/docs/themes/tools/theme-check) to analyze your theme code for errors and to ensure that it follows theme and Liquid best practices. [Learn more about the checks that Theme Check runs.](https://shopify.dev/docs/themes/tools/theme-check/checks)

```bash
shopify theme check [flags]
```

## Flags

The following flags are available for the `theme check` command:

### themecheck

### --fail-level <value>

env: SHOPIFY_FLAG_FAIL_LEVEL
value: `string`

Minimum severity for exit with error code

### --init

env: SHOPIFY_FLAG_INIT
value: `""`

Generate a .theme-check.yml file

### --list

env: SHOPIFY_FLAG_LIST
value: `""`

List enabled checks

### --no-color

env: SHOPIFY_FLAG_NO_COLOR
value: `""`

Disable color output.

### --path <value>

env: SHOPIFY_FLAG_PATH
value: `string`

The path where you want to run the command. Defaults to the current working directory.

### --print

env: SHOPIFY_FLAG_PRINT
value: `""`

Output active config to STDOUT

### --verbose

env: SHOPIFY_FLAG_VERBOSE
value: `""`

Increase the verbosity of the output.

### -a, --auto-correct

env: SHOPIFY_FLAG_AUTO_CORRECT
value: `""`

Automatically fix offenses

### -C, --config <value>

env: SHOPIFY_FLAG_CONFIG
value: `string`

Use the config provided, overriding .theme-check.yml if present  Supports all theme-check: config values, e.g., theme-check:theme-app-extension,
 theme-check:recommended, theme-check:all
 For backwards compatibility, :theme_app_extension is also supported

### -e, --environment <value>

env: SHOPIFY_FLAG_ENVIRONMENT
value: `string`

The environment to apply to the current command.

### -o, --output <value>

env: SHOPIFY_FLAG_OUTPUT
value: `string`

The output format to use

### -v, --version

env: SHOPIFY_FLAG_VERSION
value: `""`

Print Theme Check version


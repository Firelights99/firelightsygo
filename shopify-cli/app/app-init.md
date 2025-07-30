# app init

Create a new app project

```bash
shopify app init [flags]
```

## Flags

The following flags are available for the `app init` command:

### appinit

### --client-id <value>

env: SHOPIFY_FLAG_CLIENT_ID
value: `string`

The Client ID of your app. Use this to automatically link your new project to an existing app. Using this flag avoids the app selection prompt.

### --flavor <value>

env: SHOPIFY_FLAG_TEMPLATE_FLAVOR
value: `string`

Which flavor of the given template to use.

### --no-color

env: SHOPIFY_FLAG_NO_COLOR
value: `""`

Disable color output.

### --template <value>

env: SHOPIFY_FLAG_TEMPLATE
value: `string`

The app template. Accepts one of the following:   - <remix|none>
  - Any GitHub repo with optional branch and subpath, e.g., https://github.com/Shopify/<repository>/[subpath]#[branch]

### --verbose

env: SHOPIFY_FLAG_VERBOSE
value: `""`

Increase the verbosity of the output.

### -d, --package-manager <value>

env: SHOPIFY_FLAG_PACKAGE_MANAGER
value: `string`


### -n, --name <value>

env: SHOPIFY_FLAG_NAME
value: `string`


### -p, --path <value>

env: SHOPIFY_FLAG_PATH
value: `string`



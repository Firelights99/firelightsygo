# hydrogen deploy

Builds and deploys your Hydrogen storefront to Oxygen. Requires an Oxygen deployment token to be set with the `--token` flag or an environment variable (`SHOPIFY_HYDROGEN_DEPLOYMENT_TOKEN`). If the storefront is [linked](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-link) then the Oxygen deployment token for the linked storefront will be used automatically.

```bash
shopify hydrogen deploy [flags]
```

## Flags

The following flags are available for the `hydrogen deploy` command:

### hydrogendeploy

### --auth-bypass-token

env: AUTH_BYPASS_TOKEN
value: `""`

Generate an authentication bypass token, which can be used to perform end-to-end tests against the deployment.

### --auth-bypass-token-duration <value>

env: AUTH_BYPASS_TOKEN_DURATION
value: `string`

Specify the duration (in hours) up to 12 hours for the authentication bypass token. Defaults to `2`

### --build-command <value>

value: `string`

Specify a build command to run before deploying. If not specified, `shopify hydrogen build` will be used.

### --entry <value>

env: SHOPIFY_HYDROGEN_FLAG_ENTRY
value: `string`

Entry file for the worker. Defaults to `./server`.

### --env <value>

value: `string`

Specifies the environment to perform the operation using its handle. Fetch the handle using the `env list` command.

### --env-branch <value>

env: SHOPIFY_HYDROGEN_ENVIRONMENT_BRANCH
value: `string`

Specifies the environment to perform the operation using its Git branch name.

### --env-file <value>

value: `string`

Path to an environment file to override existing environment variables for the deployment.

### --json-output

value: `""`

Create a JSON file containing the deployment details in CI environments. Defaults to true, use `--no-json-output` to disable.

### --lockfile-check

env: SHOPIFY_HYDROGEN_FLAG_LOCKFILE_CHECK
value: `""`

Checks that there is exactly one valid lockfile in the project. Defaults to `true`. Deactivate with `--no-lockfile-check`.

### --metadata-description <value>

env: SHOPIFY_HYDROGEN_FLAG_METADATA_DESCRIPTION
value: `string`

Description of the changes in the deployment. Defaults to the commit message of the latest commit if there are no uncommited changes.

### --metadata-user <value>

env: SHOPIFY_HYDROGEN_FLAG_METADATA_USER
value: `string`

User that initiated the deployment. Will be saved and displayed in the Shopify admin

### --no-verify

value: `""`

Skip the routability verification step after deployment.

### --path <value>

env: SHOPIFY_HYDROGEN_FLAG_PATH
value: `string`

The path to the directory of the Hydrogen storefront. Defaults to the current directory where the command is run.

### --preview

value: `""`

Deploys to the Preview environment.

### -f, --force

env: SHOPIFY_HYDROGEN_FLAG_FORCE
value: `""`

Forces a deployment to proceed if there are uncommited changes in its Git repository.

### -s, --shop <value>

env: SHOPIFY_SHOP
value: `string`

Shop URL. It can be the shop prefix (janes-apparel) or the full myshopify.com URL (janes-apparel.myshopify.com, https://janes-apparel.myshopify.com).

### -t, --token <value>

env: SHOPIFY_HYDROGEN_DEPLOYMENT_TOKEN
value: `string`

Oxygen deployment token. Defaults to the linked storefront's token if available.


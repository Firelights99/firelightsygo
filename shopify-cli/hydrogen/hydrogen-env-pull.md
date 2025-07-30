# hydrogen env pull

Pulls environment variables from the linked Hydrogen storefront and writes them to an `.env` file.

```bash
shopify hydrogen env pull [flags]
```

## Flags

The following flags are available for the `hydrogen env pull` command:

### hydrogenenvpull

### --env <value>

value: `string`

Specifies the environment to perform the operation using its handle. Fetch the handle using the `env list` command.

### --env-branch <value>

env: SHOPIFY_HYDROGEN_ENVIRONMENT_BRANCH
value: `string`

Specifies the environment to perform the operation using its Git branch name.

### --env-file <value>

value: `string`

Path to an environment file to override existing environment variables. Defaults to the '.env' located in your project path `--path`.

### --path <value>

env: SHOPIFY_HYDROGEN_FLAG_PATH
value: `string`

The path to the directory of the Hydrogen storefront. Defaults to the current directory where the command is run.

### -f, --force

env: SHOPIFY_HYDROGEN_FLAG_FORCE
value: `""`

Overwrites the destination directory and files if they already exist.


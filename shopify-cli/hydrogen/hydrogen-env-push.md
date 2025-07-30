# hydrogen env push

Push environment variables from the local .env file to your linked Hydrogen storefront.

```bash
shopify hydrogen env push [flags]
```

## Flags

The following flags are available for the `hydrogen env push` command:

### hydrogenenvpush

### --env <value>

value: `string`

Specifies the environment to perform the operation using its handle. Fetch the handle using the `env list` command.

### --env-file <value>

value: `string`

Path to an environment file to override existing environment variables. Defaults to the '.env' located in your project path `--path`.

### --path <value>

env: SHOPIFY_HYDROGEN_FLAG_PATH
value: `string`

The path to the directory of the Hydrogen storefront. Defaults to the current directory where the command is run.


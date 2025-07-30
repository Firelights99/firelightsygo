# Shopify CLI App commands

## app build

This command executes the build script specified in the element's TOML file. You can specify a custom script in the file. To learn about configuration files in Shopify apps, refer to [App configuration](https://shopify.dev/docs/apps/tools/cli/configuration).

  If you're building a [theme app extension](https://shopify.dev/docs/apps/online-store/theme-app-extensions), then running the `build` command runs [Theme Check](https://shopify.dev/docs/themes/tools/theme-check) against your extension to ensure that it's valid.
[View app build](https://shopify.dev/docs/api/shopify-cli/app/app-build)

## app config link

Pulls app configuration from the Partner Dashboard and creates or overwrites a configuration file. You can create a new app with this command to start with a default configuration file.

  For more information on the format of the created TOML configuration file, refer to the [App configuration](https://shopify.dev/docs/apps/tools/cli/configuration) page.
  
[View app config link](https://shopify.dev/docs/api/shopify-cli/app/app-config-link)

## app config use

Sets default configuration when you run app-related CLI commands. If you omit the `config-name` parameter, then you'll be prompted to choose from the configuration files in your project.
[View app config use](https://shopify.dev/docs/api/shopify-cli/app/app-config-use)

## app deploy

[Builds the app](https://shopify.dev/docs/api/shopify-cli/app/app-build), then deploys your app configuration and extensions.

  This command creates an app version, which is a snapshot of your app configuration and all extensions, including the app extensions that you manage in the Partner Dashboard. This version is then released to users.

  This command doesn't deploy your [web app](https://shopify.dev/docs/apps/tools/cli/structure#web-components). You need to [deploy your web app](https://shopify.dev/docs/apps/deployment/web) to your own hosting solution.
  
[View app deploy](https://shopify.dev/docs/api/shopify-cli/app/app-deploy)

## app dev clean

Stop the app preview that was started with `shopify app dev`.

  It restores the app's active version to the selected development store.

  It's valid only for apps created on the Next-Gen Dev Platform.
  
[View app dev clean](https://shopify.dev/docs/api/shopify-cli/app/app-dev-clean)

## app dev

[Builds the app](https://shopify.dev/docs/api/shopify-cli/app/app-build) and lets you preview it on a [development store](https://shopify.dev/docs/apps/tools/development-stores) or [Plus sandbox store](https://help.shopify.com/partners/dashboard/managing-stores/plus-sandbox-store).

> Note: Development store preview of extension drafts is not supported for Plus sandbox stores. You must `deploy` your app.

  To preview your app on a development store or Plus sandbox store, Shopify CLI walks you through the following steps. If you've run `dev` before, then your settings are saved and some of these steps are skipped. You can reset these configurations using `dev --reset` to go through all of them again:

- Associating your project with an app associated with your Partner account or organization, or creating a new app.
- Selecting a development store or Plus sandbox store to use for testing. If you have only one store, then it's selected automatically.
- Installing your app on the store using the provided install link.
- Creating a tunnel between your local environment and the store using Cloudflare.

  You can use your own tunneling software instead, by passing your tunnel URL with the `--tunnel-url` flag.
- Updating the app URLs that are set in the Partner Dashboard.

  To avoid overwriting any URLs that are already set, select the No, never option. If you select this option, then you're provided with URLs that you can manually add in the Partner Dashboard so you can preview your app.

- Enabling development store preview for extensions.
- Serving [GraphiQL for the Admin API](https://shopify.dev/docs/apps/tools/graphiql-admin-api#use-a-local-graphiql-instance) using your app's credentials and access scopes.
- Building and serving your app and app extensions.

If you're using the Ruby app template, then you need to complete the following steps outlined in the [README](https://github.com/Shopify/shopify-app-template-ruby#setting-up-your-rails-app) before you can preview your app for the first time.

> Caution: To use a development store or Plus sandbox store with Shopify CLI, you need to be the store owner, or have a [staff account](https://help.shopify.com/manual/your-account/staff-accounts) on the store. Staff accounts are created automatically the first time you access a development store with your Partner staff account through the Partner Dashboard.

[View app dev](https://shopify.dev/docs/api/shopify-cli/app/app-dev)

## app env pull

Creates or updates an `.env` files that contains app and app extension environment variables.

  When an existing `.env` file is updated, changes to the variables are displayed in the terminal output. Existing variables and commented variables are preserved.
[View app env pull](https://shopify.dev/docs/api/shopify-cli/app/app-env-pull)

## app env show

Displays environment variables that can be used to deploy apps and app extensions.
[View app env show](https://shopify.dev/docs/api/shopify-cli/app/app-env-show)

## app function build

Compiles the function in your current directory to WebAssembly (Wasm) for testing purposes.
[View app function build](https://shopify.dev/docs/api/shopify-cli/app/app-function-build)

## app function replay

Runs the function from your current directory for [testing purposes](https://shopify.dev/docs/apps/functions/testing-and-debugging). To learn how you can monitor and debug functions when errors occur, refer to [Shopify Functions error handling](https://shopify.dev/docs/api/functions/errors).
[View app function replay](https://shopify.dev/docs/api/shopify-cli/app/app-function-replay)

## app function run

Runs the function from your current directory for [testing purposes](https://shopify.dev/docs/apps/functions/testing-and-debugging). To learn how you can monitor and debug functions when errors occur, refer to [Shopify Functions error handling](https://shopify.dev/docs/api/functions/errors).
[View app function run](https://shopify.dev/docs/api/shopify-cli/app/app-function-run)

## app function schema

Generates the latest [GraphQL schema](https://shopify.dev/docs/apps/functions/input-output#graphql-schema) for a function in your app. Run this command from the function directory.

  This command uses the API type and version of your function, as defined in your extension TOML file, to generate the latest GraphQL schema. The schema is written to the `schema.graphql` file.
[View app function schema](https://shopify.dev/docs/api/shopify-cli/app/app-function-schema)

## app function typegen

Creates GraphQL types based on your [input query](https://shopify.dev/docs/apps/functions/input-output#input) for a function written in JavaScript.
[View app function typegen](https://shopify.dev/docs/api/shopify-cli/app/app-function-typegen)

## app generate extension

Generates a new [app extension](https://shopify.dev/docs/apps/app-extensions). For a list of app extensions that you can generate using this command, refer to [Supported extensions](https://shopify.dev/docs/apps/structure/app-extensions/list).

  Each new app extension is created in a folder under `extensions/`. To learn more about the extensions file structure, refer to [App structure](https://shopify.dev/docs/apps/tools/cli/structure) and the documentation for your extension.
  
[View app generate extension](https://shopify.dev/docs/api/shopify-cli/app/app-generate-extension)

## app import-extensions

Import dashboard-managed extensions into your app.
[View app import-extensions](https://shopify.dev/docs/api/shopify-cli/app/app-import-extensions)

## app info

The information returned includes the following:

  - The app and development store or Plus sandbox store that's used when you run the [dev](https://shopify.dev/docs/api/shopify-cli/app/app-dev) command. You can reset these configurations using [`dev --reset`](https://shopify.dev/docs/api/shopify-cli/app/app-dev#flags-propertydetail-reset).
  - The [structure](https://shopify.dev/docs/apps/tools/cli/structure) of your app project.
  - The [access scopes](https://shopify.dev/docs/api/usage) your app has requested.
  - System information, including the package manager and version of Shopify CLI used in the project.
[View app info](https://shopify.dev/docs/api/shopify-cli/app/app-info)

## app init

Create a new app project
[View app init](https://shopify.dev/docs/api/shopify-cli/app/app-init)

## app logs sources

The output source names can be used with the `--source` argument of `shopify app logs` to filter log output. Currently only function extensions are supported as sources.
[View app logs sources](https://shopify.dev/docs/api/shopify-cli/app/app-logs-sources)

## app logs


  Opens a real-time stream of detailed app logs from the selected app and store.
  Use the `--source` argument to limit output to a particular log source, such as a specific Shopify Function handle. Use the `shopify app logs sources` command to view a list of sources.
  Use the `--status` argument to filter on status, either `success` or `failure`.
  ```
  shopify app logs --status=success --source=extension.discount-function
  ```
  
[View app logs](https://shopify.dev/docs/api/shopify-cli/app/app-logs)

## app release

Releases an existing app version. Pass the name of the version that you want to release using the `--version` flag.
[View app release](https://shopify.dev/docs/api/shopify-cli/app/app-release)

## app versions list

Lists the deployed app versions. An app version is a snapshot of your app extensions.
[View app versions list](https://shopify.dev/docs/api/shopify-cli/app/app-versions-list)

## app webhook trigger


  Triggers the delivery of a sample Admin API event topic payload to a designated address.

  You should use this command to experiment with webhooks, to initially test your webhook configuration, or for unit testing. However, to test your webhook configuration from end to end, you should always trigger webhooks by performing the related action in Shopify.

  Because most webhook deliveries use remote endpoints, you can trigger the command from any directory where you can use Shopify CLI, and send the webhook to any of the supported endpoint types. For example, you can run the command from your app's local directory, but send the webhook to a staging environment endpoint.

  To learn more about using webhooks in a Shopify app, refer to [Webhooks overview](https://shopify.dev/docs/apps/webhooks).

  ### Limitations

  - Webhooks triggered using this method always have the same payload, so they can't be used to test scenarios that differ based on the payload contents.
  - Webhooks triggered using this method aren't retried when they fail.
  - Trigger requests are rate-limited using the [Partner API rate limit](https://shopify.dev/docs/api/partner#rate_limits).
  - You can't use this method to validate your API webhook subscriptions.
  
[View app webhook trigger](https://shopify.dev/docs/api/shopify-cli/app/app-webhook-trigger)


# Shopify CLI Hydrogen commands

## hydrogen build

Builds a Hydrogen storefront for production. The client and app worker files are compiled to a `/dist` folder in your Hydrogen project directory.
[View hydrogen build](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-build)

## hydrogen check

Checks whether your Hydrogen app includes a set of standard Shopify routes.
[View hydrogen check](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-check)

## hydrogen codegen

Automatically generates GraphQL types for your project’s Storefront API queries.
[View hydrogen codegen](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-codegen)

## hydrogen customer-account-push

Push project configuration to admin
[View hydrogen customer-account-push](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-customer-account-push)

## hydrogen debug cpu

Builds the app and runs the resulting code to profile the server startup time, watching for changes. This command can be used to [debug slow app startup times](https://shopify.dev/docs/custom-storefronts/hydrogen/debugging/cpu-startup) that cause failed deployments in Oxygen.

  The profiling results are written to a `.cpuprofile` file that can be viewed with certain tools such as [Flame Chart Visualizer for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-js-profile-flame).
[View hydrogen debug cpu](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-debug-cpu)

## hydrogen deploy

Builds and deploys your Hydrogen storefront to Oxygen. Requires an Oxygen deployment token to be set with the `--token` flag or an environment variable (`SHOPIFY_HYDROGEN_DEPLOYMENT_TOKEN`). If the storefront is [linked](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-link) then the Oxygen deployment token for the linked storefront will be used automatically.
[View hydrogen deploy](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-deploy)

## hydrogen dev

Runs a Hydrogen storefront in a local runtime that emulates an Oxygen worker for development.

  If your project is [linked](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-link) to a Hydrogen storefront, then its environment variables will be loaded with the runtime.
[View hydrogen dev](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-dev)

## hydrogen env list

Lists all environments available on the linked Hydrogen storefront.
[View hydrogen env list](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-env-list)

## hydrogen env pull

Pulls environment variables from the linked Hydrogen storefront and writes them to an `.env` file.
[View hydrogen env pull](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-env-pull)

## hydrogen env push

Push environment variables from the local .env file to your linked Hydrogen storefront.
[View hydrogen env push](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-env-push)

## hydrogen generate route

Generates a set of default routes from the starter template.
[View hydrogen generate route](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-generate-route)

## hydrogen generate routes

Generates all supported standard shopify routes.
[View hydrogen generate routes](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-generate-routes)

## hydrogen init

Creates a new Hydrogen storefront.
[View hydrogen init](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-init)

## hydrogen link

Links your local development environment to a remote Hydrogen storefront. You can link an unlimited number of development environments to a single Hydrogen storefront.

  Linking to a Hydrogen storefront enables you to run [dev](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-dev) and automatically inject your linked Hydrogen storefront's environment variables directly into the server runtime.

  After you run the `link` command, you can access the [env list](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-env-list), [env pull](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-env-pull), and [unlink](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-unlink) commands.
[View hydrogen link](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-link)

## hydrogen list

Lists all remote Hydrogen storefronts available to link to your local development environment.
[View hydrogen list](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-list)

## hydrogen login

Logs in to the specified shop and saves the shop domain to the project.
[View hydrogen login](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-login)

## hydrogen logout

Log out from the current shop.
[View hydrogen logout](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-logout)

## hydrogen preview

Runs a server in your local development environment that serves your Hydrogen app's production build. Requires running the [build](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-build) command first.
[View hydrogen preview](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-preview)

## hydrogen setup css

Adds support for certain CSS strategies to your project.
[View hydrogen setup css](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-setup-css)

## hydrogen setup markets

Adds support for multiple [markets](https://shopify.dev/docs/custom-storefronts/hydrogen/markets) to your project by using the URL structure.
[View hydrogen setup markets](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-setup-markets)

## hydrogen setup vite

EXPERIMENTAL: Upgrades the project to use Vite.
[View hydrogen setup vite](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-setup-vite)

## hydrogen setup

Scaffold routes and core functionality.
[View hydrogen setup](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-setup)

## hydrogen shortcut

Creates a global h2 shortcut for Shopify CLI using shell aliases.

  The following shells are supported:

  - Bash (using `~/.bashrc`)
  - ZSH (using `~/.zshrc`)
  - Fish (using `~/.config/fish/functions`)
  - PowerShell (added to `$PROFILE`)

  After the alias is created, you can call Shopify CLI from anywhere in your project using `h2 <command>`.
[View hydrogen shortcut](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-shortcut)

## hydrogen unlink

Unlinks your local development environment from a remote Hydrogen storefront.
[View hydrogen unlink](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-unlink)

## hydrogen upgrade

Upgrade Hydrogen project dependencies, preview features, fixes and breaking changes. The command also generates an instruction file for each upgrade.
[View hydrogen upgrade](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-upgrade)


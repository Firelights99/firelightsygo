# Shopify CLI

Shopify CLI is a command-line interface tool that helps you generate and work with Shopify apps, themes and custom storefronts. You can also use it to automate many common development tasks.

## Requirements


- [Node.js](https://nodejs.org/en/download/): 20.10 or higher
- A Node.js package manager: [npm](https://www.npmjs.com/get-npm), [Yarn 1.x](https://classic.yarnpkg.com/lang/en/docs/install), or [pnpm](https://pnpm.io/installation).
- [Git](https://git-scm.com/downloads): 2.28.0 or higher


## Installation

This installs Shopify CLI globally on your system, so you can run `shopify` commands from any directory. Find out more about the available commands by running `shopify` in your terminal.
```bash
npm install -g @shopify/cli@latest

```

```bash
yarn global add @shopify/cli@latest

```

```bash
pnpm install -g @shopify/cli@latest

```

```bash
# Only for macOS
brew tap shopify/shopify
brew install shopify-cli

```


## Commands


Shopify CLI groups commands into topics. The command syntax is: `shopify [topic] [command]`.
Refer to each topic section in the sidebar for a list of available commands.

Or, run the `help` command to get this information right in your terminal.

```bash
shopify help

```


## Upgrade Shopify CLI

We recommend that you always use the latest version of Shopify CLI if possible. To upgrade, run `version` to check the current version and determine if there are any updates available. Run the [install](#installation) command to upgrade to the latest CLI version.
```bash
shopify version
> Current Shopify CLI version: 3.50.0
> 💡 Version 3.51.0 available!

npm install -g @shopify/cli@latest

```


## Network proxy configuration

When working behind a network proxy, you can configure Shopify CLI (version 3.78+) to route connections through it:

1. Set the proxy for HTTP traffic:

   ```bash
   export SHOPIFY_HTTP_PROXY=http://proxy.com:8080
   ```

2. Optionally, set a different proxy for HTTPS traffic:

   ```bash
   export SHOPIFY_HTTPS_PROXY=https://secure-proxy.com:8443
   ```

   If not specified, the HTTP proxy will be used for all traffic.

3. For authenticated proxies, include credentials in the URL:

   ```bash
   export SHOPIFY_HTTP_PROXY=http://username:password@proxy.com:8080
   ```

## Usage reporting

Anonymous usage statistics are collected by default. To opt out, you can use the environment variable `SHOPIFY_CLI_NO_ANALYTICS=1`.

## Contribute to Shopify CLI

Shopify CLI is open source. [Learn how to contribute](https://github.com/Shopify/cli/wiki/Contributors:-Introduction) to our GitHub repository.

## Where to get help


- [Shopify Community Forums](https://community.shopify.com/) - Visit our forums to connect with the community and learn more about Shopify CLI development.
- [Open a GitHub issue](https://github.com/shopify/cli/issues) - To report bugs or request new features, open an issue in the Shopify CLI repository.


## References

- [app build](https://shopify.dev/docs/api/shopify-cli/app/app-build): Build the app, including extensions.
- [app config link](https://shopify.dev/docs/api/shopify-cli/app/app-config-link): Fetch your app configuration from the Partner Dashboard.
- [app config use](https://shopify.dev/docs/api/shopify-cli/app/app-config-use): Activate an app configuration.
- [app deploy](https://shopify.dev/docs/api/shopify-cli/app/app-deploy): Deploy your Shopify app.
- [app dev clean](https://shopify.dev/docs/api/shopify-cli/app/app-dev-clean): Cleans up the app preview from the selected store.
- [app dev](https://shopify.dev/docs/api/shopify-cli/app/app-dev): Run the app.
- [app env pull](https://shopify.dev/docs/api/shopify-cli/app/app-env-pull): Pull app and extensions environment variables.
- [app env show](https://shopify.dev/docs/api/shopify-cli/app/app-env-show): Display app and extensions environment variables.
- [app function build](https://shopify.dev/docs/api/shopify-cli/app/app-function-build): Compile a function to wasm.
- [app function replay](https://shopify.dev/docs/api/shopify-cli/app/app-function-replay): Replays a function run from an app log.
- [app function run](https://shopify.dev/docs/api/shopify-cli/app/app-function-run): Run a function locally for testing.
- [app function schema](https://shopify.dev/docs/api/shopify-cli/app/app-function-schema): Fetch the latest GraphQL schema for a function.
- [app function typegen](https://shopify.dev/docs/api/shopify-cli/app/app-function-typegen): Generate GraphQL types for a JavaScript function.
- [app generate extension](https://shopify.dev/docs/api/shopify-cli/app/app-generate-extension): Generate a new app Extension.
- [app import-extensions](https://shopify.dev/docs/api/shopify-cli/app/app-import-extensions): Import dashboard-managed extensions into your app.
- [app info](https://shopify.dev/docs/api/shopify-cli/app/app-info): Print basic information about your app and extensions.
- [app init](https://shopify.dev/docs/api/shopify-cli/app/app-init): Create a new app project
- [app logs sources](https://shopify.dev/docs/api/shopify-cli/app/app-logs-sources): Print out a list of sources that may be used with the logs command.
- [app logs](https://shopify.dev/docs/api/shopify-cli/app/app-logs): Stream detailed logs for your Shopify app.
- [app release](https://shopify.dev/docs/api/shopify-cli/app/app-release): Release an app version.
- [app versions list](https://shopify.dev/docs/api/shopify-cli/app/app-versions-list): List deployed versions of your app.
- [app webhook trigger](https://shopify.dev/docs/api/shopify-cli/app/app-webhook-trigger): Trigger delivery of a sample webhook topic payload to a designated address.
- [auth logout](https://shopify.dev/docs/api/shopify-cli/general-commands/auth-logout): Logs you out of the Shopify account or Partner account and store.
- [commands](https://shopify.dev/docs/api/shopify-cli/general-commands/commands): List all shopify commands.
- [config autocorrect off](https://shopify.dev/docs/api/shopify-cli/general-commands/config-autocorrect-off): Disable autocorrect. Off by default.
- [config autocorrect on](https://shopify.dev/docs/api/shopify-cli/general-commands/config-autocorrect-on): Enable autocorrect. Off by default.
- [config autocorrect status](https://shopify.dev/docs/api/shopify-cli/general-commands/config-autocorrect-status): Check whether autocorrect is enabled or disabled. On by default.
- [help](https://shopify.dev/docs/api/shopify-cli/general-commands/help): Display help for Shopify CLI
- [hydrogen build](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-build): Builds a Hydrogen storefront for production. The client and app worker files are compiled to a `/dist` folder in your Hydrogen project directory.
- [hydrogen check](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-check): Checks whether your Hydrogen app includes a set of standard Shopify routes.
- [hydrogen codegen](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-codegen): Automatically generates GraphQL types for your project’s Storefront API queries.
- [hydrogen customer-account-push](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-customer-account-push): Push project configuration to admin
- [hydrogen debug cpu](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-debug-cpu): Builds the app and runs the resulting code to profile the server startup time, watching for changes. This command can be used to [debug slow app startup times](https://shopify.dev/docs/custom-storefronts/hydrogen/debugging/cpu-startup) that cause failed deployments in Oxygen.

  The profiling results are written to a `.cpuprofile` file that can be viewed with certain tools such as [Flame Chart Visualizer for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-js-profile-flame).
- [hydrogen deploy](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-deploy): Builds and deploys your Hydrogen storefront to Oxygen. Requires an Oxygen deployment token to be set with the `--token` flag or an environment variable (`SHOPIFY_HYDROGEN_DEPLOYMENT_TOKEN`). If the storefront is [linked](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-link) then the Oxygen deployment token for the linked storefront will be used automatically.
- [hydrogen dev](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-dev): Runs a Hydrogen storefront in a local runtime that emulates an Oxygen worker for development.

  If your project is [linked](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-link) to a Hydrogen storefront, then its environment variables will be loaded with the runtime.
- [hydrogen env list](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-env-list): Lists all environments available on the linked Hydrogen storefront.
- [hydrogen env pull](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-env-pull): Pulls environment variables from the linked Hydrogen storefront and writes them to an `.env` file.
- [hydrogen env push](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-env-push): Push environment variables from the local .env file to your linked Hydrogen storefront.
- [hydrogen generate route](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-generate-route): Generates a set of default routes from the starter template.
- [hydrogen generate routes](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-generate-routes): Generates all supported standard shopify routes.
- [hydrogen init](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-init): Creates a new Hydrogen storefront.
- [hydrogen link](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-link): Links your local development environment to a remote Hydrogen storefront. You can link an unlimited number of development environments to a single Hydrogen storefront.

  Linking to a Hydrogen storefront enables you to run [dev](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-dev) and automatically inject your linked Hydrogen storefront's environment variables directly into the server runtime.

  After you run the `link` command, you can access the [env list](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-env-list), [env pull](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-env-pull), and [unlink](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-unlink) commands.
- [hydrogen list](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-list): Lists all remote Hydrogen storefronts available to link to your local development environment.
- [hydrogen login](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-login): Logs in to the specified shop and saves the shop domain to the project.
- [hydrogen logout](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-logout): Log out from the current shop.
- [hydrogen preview](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-preview): Runs a server in your local development environment that serves your Hydrogen app's production build. Requires running the [build](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-build) command first.
- [hydrogen setup css](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-setup-css): Adds support for certain CSS strategies to your project.
- [hydrogen setup markets](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-setup-markets): Adds support for multiple [markets](https://shopify.dev/docs/custom-storefronts/hydrogen/markets) to your project by using the URL structure.
- [hydrogen setup vite](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-setup-vite): EXPERIMENTAL: Upgrades the project to use Vite.
- [hydrogen setup](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-setup): Scaffold routes and core functionality.
- [hydrogen shortcut](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-shortcut): Creates a global h2 shortcut for Shopify CLI using shell aliases.

  The following shells are supported:

  - Bash (using `~/.bashrc`)
  - ZSH (using `~/.zshrc`)
  - Fish (using `~/.config/fish/functions`)
  - PowerShell (added to `$PROFILE`)

  After the alias is created, you can call Shopify CLI from anywhere in your project using `h2 <command>`.
- [hydrogen unlink](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-unlink): Unlinks your local development environment from a remote Hydrogen storefront.
- [hydrogen upgrade](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-upgrade): Upgrade Hydrogen project dependencies, preview features, fixes and breaking changes. The command also generates an instruction file for each upgrade.
- [search](https://shopify.dev/docs/api/shopify-cli/general-commands/search): Starts a search on shopify.dev.
- [theme check](https://shopify.dev/docs/api/shopify-cli/theme/theme-check): Validate the theme.
- [theme console](https://shopify.dev/docs/api/shopify-cli/theme/theme-console): Shopify Liquid REPL (read-eval-print loop) tool
- [theme delete](https://shopify.dev/docs/api/shopify-cli/theme/theme-delete): Delete remote themes from the connected store. This command can't be undone.
- [theme dev](https://shopify.dev/docs/api/shopify-cli/theme/theme-dev): Uploads the current theme as a development theme to the connected store, then prints theme editor and preview URLs to your terminal. While running, changes will push to the store in real time.
- [theme duplicate](https://shopify.dev/docs/api/shopify-cli/theme/theme-duplicate): Duplicates a theme from your theme library.
- [theme info](https://shopify.dev/docs/api/shopify-cli/theme/theme-info): Displays information about your theme environment, including your current store. Can also retrieve information about a specific theme.
- [theme init](https://shopify.dev/docs/api/shopify-cli/theme/theme-init): Clones a Git repository to use as a starting point for building a new theme.
- [theme language-server](https://shopify.dev/docs/api/shopify-cli/theme/theme-language-server): Start a Language Server Protocol server.
- [theme list](https://shopify.dev/docs/api/shopify-cli/theme/theme-list): Lists the themes in your store, along with their IDs and statuses.
- [theme metafields pull](https://shopify.dev/docs/api/shopify-cli/theme/theme-metafields-pull): Download metafields definitions from your shop into a local file.
- [theme open](https://shopify.dev/docs/api/shopify-cli/theme/theme-open): Opens the preview of your remote theme.
- [theme package](https://shopify.dev/docs/api/shopify-cli/theme/theme-package): Package your theme into a .zip file, ready to upload to the Online Store.
- [theme profile](https://shopify.dev/docs/api/shopify-cli/theme/theme-profile): Profile the Liquid rendering of a theme page.
- [theme publish](https://shopify.dev/docs/api/shopify-cli/theme/theme-publish): Set a remote theme as the live theme.
- [theme pull](https://shopify.dev/docs/api/shopify-cli/theme/theme-pull): Download your remote theme files locally.
- [theme push](https://shopify.dev/docs/api/shopify-cli/theme/theme-push): Uploads your local theme files to the connected store, overwriting the remote version if specified.
- [theme rename](https://shopify.dev/docs/api/shopify-cli/theme/theme-rename): Renames an existing theme.
- [theme share](https://shopify.dev/docs/api/shopify-cli/theme/theme-share): Creates a shareable, unpublished, and new theme on your theme library with a randomized name.
- [upgrade](https://shopify.dev/docs/api/shopify-cli/general-commands/upgrade): Shows details on how to upgrade Shopify CLI.
- [version](https://shopify.dev/docs/api/shopify-cli/general-commands/version): Shopify CLI version currently installed.



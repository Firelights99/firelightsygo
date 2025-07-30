# Shopify CLI Theme commands

## theme check

Calls and runs [Theme Check](https://shopify.dev/docs/themes/tools/theme-check) to analyze your theme code for errors and to ensure that it follows theme and Liquid best practices. [Learn more about the checks that Theme Check runs.](https://shopify.dev/docs/themes/tools/theme-check/checks)
[View theme check](https://shopify.dev/docs/api/shopify-cli/theme/theme-check)

## theme console

Starts the Shopify Liquid REPL (read-eval-print loop) tool. This tool provides an interactive terminal interface for evaluating Liquid code and exploring Liquid objects, filters, and tags using real store data.

  You can also provide context to the console using a URL, as some Liquid objects are context-specific
[View theme console](https://shopify.dev/docs/api/shopify-cli/theme/theme-console)

## theme delete

Deletes a theme from your store.

  You can specify multiple themes by ID. If no theme is specified, then you're prompted to select the theme that you want to delete from the list of themes in your store.

  You're asked to confirm that you want to delete the specified themes before they are deleted. You can skip this confirmation using the `--force` flag.
[View theme delete](https://shopify.dev/docs/api/shopify-cli/theme/theme-delete)

## theme dev


  Uploads the current theme as the specified theme, or a [development theme](https://shopify.dev/docs/themes/tools/cli#development-themes), to a store so you can preview it.

This command returns the following information:

- A link to your development theme at http://127.0.0.1:9292. This URL can hot reload local changes to CSS and sections, or refresh the entire page when a file changes, enabling you to preview changes in real time using the store's data.

  You can specify a different network interface and port using `--host` and `--port`.

- A link to the [editor](https://shopify.dev/docs/themes/tools/online-editor) for the theme in the Shopify admin.

- A [preview link](https://help.shopify.com/manual/online-store/themes/adding-themes#share-a-theme-preview-with-others) that you can share with other developers.

If you already have a development theme for your current environment, then this command replaces the development theme with your local theme. You can override this using the `--theme-editor-sync` flag.

> Note: You can't preview checkout customizations using http://127.0.0.1:9292.

Development themes are deleted when you run `shopify auth logout`. If you need a preview link that can be used after you log out, then you should [share](https://shopify.dev/docs/api/shopify-cli/theme/theme-share) your theme or [push](https://shopify.dev/docs/api/shopify-cli/theme/theme-push) to an unpublished theme on your store.

You can run this command only in a directory that matches the [default Shopify theme folder structure](https://shopify.dev/docs/themes/tools/cli#directory-structure).
[View theme dev](https://shopify.dev/docs/api/shopify-cli/theme/theme-dev)

## theme duplicate

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
[View theme duplicate](https://shopify.dev/docs/api/shopify-cli/theme/theme-duplicate)

## theme info

Displays information about your theme environment, including your current store. Can also retrieve information about a specific theme.
[View theme info](https://shopify.dev/docs/api/shopify-cli/theme/theme-info)

## theme init

Clones a Git repository to your local machine to use as the starting point for building a theme.

  If no Git repository is specified, then this command creates a copy of Shopify's [Skeleton theme](https://github.com/Shopify/skeleton-theme), with the specified name in the current folder. If no name is provided, then you're prompted to enter one.

  > Caution: If you're building a theme for the Shopify Theme Store, then you can use our example theme as a starting point. However, the theme that you submit needs to be [substantively different from existing themes](https://shopify.dev/docs/themes/store/requirements#uniqueness) so that it provides added value for users.
  
[View theme init](https://shopify.dev/docs/api/shopify-cli/theme/theme-init)

## theme language-server

Starts the [Language Server](https://shopify.dev/docs/themes/tools/cli/language-server).
[View theme language-server](https://shopify.dev/docs/api/shopify-cli/theme/theme-language-server)

## theme list

Lists the themes in your store, along with their IDs and statuses.
[View theme list](https://shopify.dev/docs/api/shopify-cli/theme/theme-list)

## theme metafields pull

Retrieves metafields from Shopify Admin.

If the metafields file already exists, it will be overwritten.
[View theme metafields pull](https://shopify.dev/docs/api/shopify-cli/theme/theme-metafields-pull)

## theme open

Returns links that let you preview the specified theme. The following links are returned:

  - A link to the [editor](https://shopify.dev/docs/themes/tools/online-editor) for the theme in the Shopify admin.
  - A [preview link](https://help.shopify.com/manual/online-store/themes/adding-themes#share-a-theme-preview-with-others) that you can share with other developers.

  If you don't specify a theme, then you're prompted to select the theme to open from the list of the themes in your store.
[View theme open](https://shopify.dev/docs/api/shopify-cli/theme/theme-open)

## theme package

Packages your local theme files into a ZIP file that can be uploaded to Shopify.

  Only folders that match the [default Shopify theme folder structure](https://shopify.dev/docs/storefronts/themes/tools/cli#directory-structure) are included in the package.

  The package includes the `listings` directory if present (required for multi-preset themes per [Theme Store requirements](https://shopify.dev/docs/storefronts/themes/store/requirements#adding-presets-to-your-theme-zip-submission)).

  The ZIP file uses the name `theme_name-theme_version.zip`, based on parameters in your [settings_schema.json](https://shopify.dev/docs/storefronts/themes/architecture/config/settings-schema-json) file.
[View theme package](https://shopify.dev/docs/api/shopify-cli/theme/theme-package)

## theme profile

Profile the Shopify Liquid on a given page.

  This command will open a web page with the Speedscope profiler detailing the time spent executing Liquid on the given page.
[View theme profile](https://shopify.dev/docs/api/shopify-cli/theme/theme-profile)

## theme publish

Publishes an unpublished theme from your theme library.

If no theme ID is specified, then you're prompted to select the theme that you want to publish from the list of themes in your store.

You can run this command only in a directory that matches the [default Shopify theme folder structure](https://shopify.dev/docs/themes/tools/cli#directory-structure).

If you want to publish your local theme, then you need to run `shopify theme push` first. You're asked to confirm that you want to publish the specified theme. You can skip this confirmation using the `--force` flag.
[View theme publish](https://shopify.dev/docs/api/shopify-cli/theme/theme-publish)

## theme pull

Retrieves theme files from Shopify.

If no theme is specified, then you're prompted to select the theme to pull from the list of the themes in your store.
[View theme pull](https://shopify.dev/docs/api/shopify-cli/theme/theme-pull)

## theme push

Uploads your local theme files to Shopify, overwriting the remote version if specified.

  If no theme is specified, then you're prompted to select the theme to overwrite from the list of the themes in your store.

  You can run this command only in a directory that matches the [default Shopify theme folder structure](https://shopify.dev/docs/themes/tools/cli#directory-structure).

  This command returns the following information:

  - A link to the [editor](https://shopify.dev/docs/themes/tools/online-editor) for the theme in the Shopify admin.
  - A [preview link](https://help.shopify.com/manual/online-store/themes/adding-themes#share-a-theme-preview-with-others) that you can share with others.

  If you use the `--json` flag, then theme information is returned in JSON format, which can be used as a machine-readable input for scripts or continuous integration.

  Sample output:

  ```json
  {
    "theme": {
      "id": 108267175958,
      "name": "MyTheme",
      "role": "unpublished",
      "shop": "mystore.myshopify.com",
      "editor_url": "https://mystore.myshopify.com/admin/themes/108267175958/editor",
      "preview_url": "https://mystore.myshopify.com/?preview_theme_id=108267175958"
    }
  }
  ```
    
[View theme push](https://shopify.dev/docs/api/shopify-cli/theme/theme-push)

## theme rename

Renames a theme in your store.

  If no theme is specified, then you're prompted to select the theme that you want to rename from the list of themes in your store.
  
[View theme rename](https://shopify.dev/docs/api/shopify-cli/theme/theme-rename)

## theme share

Uploads your theme as a new, unpublished theme in your theme library. The theme is given a randomized name.

  This command returns a [preview link](https://help.shopify.com/manual/online-store/themes/adding-themes#share-a-theme-preview-with-others) that you can share with others.
[View theme share](https://shopify.dev/docs/api/shopify-cli/theme/theme-share)


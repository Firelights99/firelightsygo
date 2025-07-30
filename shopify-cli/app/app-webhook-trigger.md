# app webhook trigger


  Triggers the delivery of a sample Admin API event topic payload to a designated address.

  You should use this command to experiment with webhooks, to initially test your webhook configuration, or for unit testing. However, to test your webhook configuration from end to end, you should always trigger webhooks by performing the related action in Shopify.

  Because most webhook deliveries use remote endpoints, you can trigger the command from any directory where you can use Shopify CLI, and send the webhook to any of the supported endpoint types. For example, you can run the command from your app's local directory, but send the webhook to a staging environment endpoint.

  To learn more about using webhooks in a Shopify app, refer to [Webhooks overview](https://shopify.dev/docs/apps/webhooks).

  ### Limitations

  - Webhooks triggered using this method always have the same payload, so they can't be used to test scenarios that differ based on the payload contents.
  - Webhooks triggered using this method aren't retried when they fail.
  - Trigger requests are rate-limited using the [Partner API rate limit](https://shopify.dev/docs/api/partner#rate_limits).
  - You can't use this method to validate your API webhook subscriptions.
  

```bash
shopify app webhook trigger [flags]
```

## Flags

The following flags are available for the `app webhook trigger` command:

### appwebhooktrigger

### --address <value>

env: SHOPIFY_FLAG_ADDRESS
value: `string`

The URL where the webhook payload should be sent.                You will need a different address type for each delivery-method:
                     · For remote HTTP testing, use a URL that starts with https://
 · For local HTTP testing, use http://localhost:{port}/{url-path}
                     · For Google Pub/Sub, use pubsub://{project-id}:{topic-id}
                     · For Amazon EventBridge, use an Amazon Resource Name (ARN) starting with arn:aws:events:

### --api-version <value>

env: SHOPIFY_FLAG_API_VERSION
value: `string`

The API Version of the webhook topic.

### --client-id <value>

env: SHOPIFY_FLAG_CLIENT_ID
value: `string`

The Client ID of your app.

### --client-secret <value>

env: SHOPIFY_FLAG_CLIENT_SECRET
value: `string`

Your app's client secret. This secret allows us to return the X-Shopify-Hmac-SHA256 header that lets you validate the origin of the response that you receive.

### --delivery-method <value>

env: SHOPIFY_FLAG_DELIVERY_METHOD
value: `string`

Method chosen to deliver the topic payload. If not passed, it's inferred from the address.

### --help

env: SHOPIFY_FLAG_HELP
value: `""`

This help. When you run the trigger command the CLI will prompt you for any information that isn't passed using flags.

### --path <value>

env: SHOPIFY_FLAG_PATH
value: `string`

The path to your app directory.

### --reset

env: SHOPIFY_FLAG_RESET
value: `""`

Reset all your settings.

### --shared-secret <value>

env: SHOPIFY_FLAG_SHARED_SECRET
value: `string`

Deprecated. Please use client-secret.

### --topic <value>

env: SHOPIFY_FLAG_TOPIC
value: `string`

The requested webhook topic.

### -c, --config <value>

env: SHOPIFY_FLAG_APP_CONFIG
value: `string`

The name of the app configuration.


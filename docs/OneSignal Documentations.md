Web Configuration
6.
Upload Service Worker File
Next, you will need to download the OneSignal Service Worker file and upload it to the top-level root of your site directory.

Download Service Worker File
Add Service Worker to Your Site
Depending on how your site is hosted, you may need to contact someone to help you copy the file to your site.

Read our documentation
OneSignal Service Worker
7.
Add Code to Site
If you haven't already, add this code to the <head> section on all pages of your site that users can subscribe to.


Copy Code
<script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
<script>
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  OneSignalDeferred.push(async function(OneSignal) {
    await OneSignal.init({
      appId: "fcdaef27-646a-4dd3-9ac8-b0b44b0bba8b",
    });
  });
</script>

<script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
<script>
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  OneSignalDeferred.push(async function(OneSignal) {
    await OneSignal.init({
      appId: "fcdaef27-646a-4dd3-9ac8-b0b44b0bba8b",
    });
  });
</script>
Add Code to Your Site
Depending on how your site is hosted, you may need to contact someone to help you add this code to your site.

Read our documentation
Add Code to Your Site
8.
Add your first user
Time to subscribe to your notifications! Just go to your website and Allow push notifications.


Go To My Website

Add Your First User
Your site will be set up once you are able to subscribe your first user.

## Documentations 

> ## Documentation Index
> Fetch the complete documentation index at: https://documentation.onesignal.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OneSignal service worker

> Set up and configure the OneSignalSDKWorker.js file so your website can receive and display web push notifications through OneSignal.

The OneSignal service worker (`OneSignalSDKWorker.js`) is a JavaScript file hosted on your server that is required for web push notifications. It enables your site to receive and display notifications, even when the user is not on your page.

<Frame caption="How the OneSignal service worker processes push notifications">
  <img src="https://mintcdn.com/onesignal/MUgio66t0sYhGEvj/images/docs/67882a5-onesignsal-service-worker.jpg?fit=max&auto=format&n=MUgio66t0sYhGEvj&q=85&s=e0b50cfe6ccc36c1b2b6d36219b6e3ad" alt="Diagram showing the OneSignal service worker receiving a push event and displaying a notification" width="2016" height="949" data-path="images/docs/67882a5-onesignsal-service-worker.jpg" />
</Frame>

<Note>
  If you use the WordPress or Shopify integration, the service worker is added automatically. Skip this guide and return to [WordPress setup](./wordpress) or [Shopify setup](./shopify).
</Note>

## Service worker setup

Create a dedicated `OneSignalSDKWorker.js` file for OneSignal push notifications. If your site already has a service worker and you want to use a single file, see [Combining multiple service workers](#combining-multiple-service-workers) instead.

<Steps>
  <Step title="Download or create OneSignalSDKWorker.js">
    Download the file from the OneSignal dashboard during [Web SDK setup](./web-sdk-setup) or [from GitHub](https://github.com/OneSignal/OneSignal-Website-SDK/files/11480764/OneSignalSDK-v16-ServiceWorker.zip).

    Alternatively, create a file named `OneSignalSDKWorker.js` with the following single line of code:

    ```javascript theme={null}
    importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
    ```

    <Note>
      You can rename the file if needed (e.g., `onesignalsdkworker.js`, `ossw.js`). If you do, replace `OneSignalSDKWorker.js` in this guide with your filename.
    </Note>
  </Step>

  <Step title="Upload to your web server">
    Place `OneSignalSDKWorker.js` on your server so it is publicly accessible over HTTPS. The file must not require authentication or login to access.

    **Recommended:** Host the file in a dedicated subdirectory that never serves pages, such as `/push/onesignal/`. This avoids conflicts with other service workers on your site (e.g., a PWA or AMP service worker) and keeps the URL path stable.

    * Example: `https://yoursite.com/push/onesignal/OneSignalSDKWorker.js`

    **Alternative:** The OneSignal Web SDK defaults to looking for the file at your site root (`https://yoursite.com/OneSignalSDKWorker.js`). You can upload the file to the root directory, but it may conflict with other service workers that need root scope. If you use a PWA, place `OneSignalSDKWorker.js` in a subdirectory instead.

    <Warning>
      Choose a **permanent** URL path. Once a browser registers a service worker at a given URL, changing that URL requires a [migration](#migration-guide).
    </Warning>
  </Step>

  <Step title="Verify the file is accessible">
    Navigate to the file URL in your browser (e.g., `https://yoursite.com/push/onesignal/OneSignalSDKWorker.js`). You should see the `importScripts` line from the first step:

    <Frame caption="Expected service worker file contents in the browser">
      <img src="https://mintcdn.com/onesignal/eSOC1PsvyAo3Gten/images/push/service-worker-code-example.png?fit=max&auto=format&n=eSOC1PsvyAo3Gten&q=85&s=3add122d37c9f12a39f1d7e3d40eeaba" alt="Browser displaying the single importScripts line inside OneSignalSDKWorker.js" width="1678" height="322" data-path="images/push/service-worker-code-example.png" />
    </Frame>

    If you see a 404 error, a blank page, or a login prompt, the file is not correctly uploaded or is behind authentication.
  </Step>

  <Step title="Configure the SDK path (subdirectory only)">
    If you placed the file at your site root, no additional configuration is needed — skip to the next step.

    If you placed the file in a subdirectory, tell the SDK where to find it:

    #### Typical site setup

    1. In the OneSignal dashboard, go to **Settings > Push & In-App > Web Settings**.
    2. Under **Advanced Push Settings**, enable **Customize service worker paths and filenames**.

    <Frame caption="Service worker path configuration in the dashboard">
      <img src="https://mintcdn.com/onesignal/npQH4TNAoIbyiAie/images/dashboard/service-worker-configuration-typical-site-setup.png?fit=max&auto=format&n=npQH4TNAoIbyiAie&q=85&s=0bc69998eea5273d287af408c6e925b3" alt="OneSignal dashboard fields for service worker path, filename, and registration scope" width="1840" height="794" data-path="images/dashboard/service-worker-configuration-typical-site-setup.png" />
    </Frame>

    | Field                                 | Description                                                                                                                                       | Example                 |
    | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
    | **Path to service worker files**      | Directory where `OneSignalSDKWorker.js` is hosted.                                                                                                | `/push/onesignal/`      |
    | **Service worker filename**           | Name of the `.js` file.                                                                                                                           | `OneSignalSDKWorker.js` |
    | **Service worker registration scope** | URL path the service worker controls. Must be at or below the directory where the file is hosted. Use a path that never serves user-facing pages. | `/push/onesignal/`      |

    #### Custom code setup

    Pass `serviceWorkerPath` and `serviceWorkerParam` in your [`OneSignal.init()`](./web-push-custom-code-setup) call:

    ```html theme={null}
    <script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
    <script>
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async function(OneSignal) {
        await OneSignal.init({
          appId: "YOUR_APP_ID",
          serviceWorkerPath: "push/onesignal/OneSignalSDKWorker.js",
          serviceWorkerParam: { scope: "/push/onesignal/" },
        });
      });
    </script>
    ```

    | Parameter                  | Description                                                                                                                                       | Example                                  |
    | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
    | `serviceWorkerPath`        | Relative path from site root to the `.js` file (no leading slash).                                                                                | `"push/onesignal/OneSignalSDKWorker.js"` |
    | `serviceWorkerParam.scope` | URL path the service worker controls. Must be at or below the directory where the file is hosted. Use a path that never serves user-facing pages. | `"/push/onesignal/"`                     |
  </Step>

  <Step title="Review service worker requirements">
    The `OneSignalSDKWorker.js` file must meet all of the following requirements for push notifications to work.

    | Requirement              | Details                                                                                                                                                                                                                                              |
    | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | **Publicly accessible**  | Navigate to the file URL in a browser and confirm you see the JavaScript code.                                                                                                                                                                       |
    | **Correct content type** | The server must return `Content-Type: application/javascript; charset=utf-8`.                                                                                                                                                                        |
    | **Same origin**          | The file must be hosted on the same domain as your site. CDNs and subdomains are not allowed. See [MDN: Registering your worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers#Registering_your_worker). |
    | **HTTPS**                | Service workers require a secure context. `localhost` is the only exception during development.                                                                                                                                                      |

    <Check>
      Service worker setup is complete.
    </Check>

    <Card title="Web SDK setup" icon="browsers" href="./web-sdk-setup">
      Continue with the Web SDK setup guide for next steps.
    </Card>
  </Step>
</Steps>

***

## Combining multiple service workers

Each service worker file on your site is registered at a **scope** — a URL path that determines which pages it controls. Only one service worker can be active at a given scope. If you already have a service worker (for example, a PWA or caching worker) and want OneSignal to share the same file, you can combine them.

<Warning>
  Keeping service workers in separate files with separate scopes is simpler to maintain and avoids conflicts. Only combine them if your setup requires a single service worker file.
</Warning>

To combine, add the OneSignal `importScripts` line to your **existing** service worker file:

```javascript theme={null}
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
importScripts("https://yoursite.com/your-other-service-worker.js");
```

After combining, update the OneSignal configuration to point to your existing service worker file. Follow [Step 4: Configure the SDK path](#step-4-configure-the-sdk-path-subdirectory-only) using the path and filename of your combined file.

***

## Migration guide

This section is for existing OneSignal customers who need to change the service worker file path, filename, or scope. Do not follow these steps unless you have a specific reason to change your current configuration.

<Accordion title="When and how to migrate your service worker">
  **Reasons to migrate:**

  * The root-scope OneSignal service worker conflicts with a Progressive Web App (PWA)
  * The service worker conflicts with AMP or another caching service worker
  * Security policies prohibit third-party service worker code at root scope

  **Option 1: Change scope only (recommended)**

  Changing only the scope is the safest migration. The file stays at its current URL, so existing subscribers continue to receive notifications without interruption.

  **If your file contains only OneSignal code**

  Confirm `OneSignalSDKWorker.js` contains only:

  ```javascript theme={null}
  importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
  ```

  Update the scope using the dashboard or `serviceWorkerParam` as described in [Step 4: Configure the SDK path](#step-4-configure-the-sdk-path-subdirectory-only). No other changes are needed.

  <Warning>
    If `OneSignalSDKWorker.js` is **not** hosted at your domain root today, you must continue hosting it at its current URL with the `Service-Worker-Allowed` header for at least one year. Add a comment in your backend code or internal documentation so the file is not accidentally removed.
  </Warning>

  **If your file contains OneSignal + other code**

  Your service worker may include additional `importScripts` calls (e.g., from following the [combining multiple service workers](#combining-multiple-service-workers) guide). If your current setup still works, **keep it as-is** — splitting a merged service worker requires a two-phase rollout.

  If you must separate them:

  <Steps>
    <Step title="Add a retention comment to the existing file">
      Above the OneSignal `importScripts` line in your current service worker, add:

      ```javascript theme={null}
      // KEEP until YYYY-MM-DD: Required for push delivery to subscribers who have not revisited.
      importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
      ```

      Set the date at least **one year** in the future.
    </Step>

    <Step title="Create a new dedicated OneSignal service worker">
      Create `OneSignalSDKWorker.js` in a subdirectory (e.g., `/push/onesignal/`) containing only:

      ```javascript theme={null}
      importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
      ```
    </Step>

    <Step title="Update OneSignal configuration">
      Set the new path and scope using the dashboard or `OneSignal.init()` as described in [Step 4: Configure the SDK path](#step-4-configure-the-sdk-path-subdirectory-only).
    </Step>

    <Step title="Wait for subscribers to migrate">
      New and returning visitors automatically register with the new service worker. Wait at least one year for the majority of existing subscribers to revisit your site.
    </Step>

    <Step title="Clean up">
      [Delete inactive users](./delete-users) older than your chosen retention period, then remove the OneSignal `importScripts` line from the original service worker file.
    </Step>
  </Steps>

  **Option 2: Change filename or file location**

  Changing the filename or directory is more complex because browsers fetch the service worker from the URL where it was originally registered. Subscribers who have not revisited your site still reference the old URL.

  <Warning>
    You must continue hosting the original file at its old URL for at least one year. Removing it causes 404 errors when the browser attempts to update the service worker, and affected subscribers stop receiving notifications.
  </Warning>

  **If your file contains only OneSignal code**

  <Steps>
    <Step title="Add a retention comment to the old file">
      ```javascript theme={null}
      // KEEP until YYYY-MM-DD: Required for push delivery to subscribers still on the old service worker URL.
      importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
      ```
    </Step>

    <Step title="Create the new file at the new location">
      Place `OneSignalSDKWorker.js` (or your chosen filename) in the new directory with:

      ```javascript theme={null}
      importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
      ```
    </Step>

    <Step title="Update OneSignal configuration">
      Set the new path, filename, and scope as described in [Step 4: Configure the SDK path](#step-4-configure-the-sdk-path-subdirectory-only).
    </Step>

    <Step title="Wait for subscribers to migrate">
      New and returning visitors register with the new file automatically. Wait at least one year.
    </Step>

    <Step title="Clean up">
      [Delete inactive users](./delete-users) older than your retention period, then remove the old file.
    </Step>
  </Steps>

  **If your file contains OneSignal + other code**

  Follow the steps in **Option 1: Change scope only** above. The process is the same.
</Accordion>

***

## FAQ

### Why is my service worker returning a 404?

The file is not at the URL the SDK expects. Navigate to the full file URL in your browser to confirm it is accessible. If you placed the file in a subdirectory, verify that `serviceWorkerPath` (custom code) or the dashboard path setting matches the actual file location — including the directory and filename.

### Why are notifications not displaying after I moved the service worker file?

Existing subscribers still reference the old service worker URL. The browser fetches the registered URL (cached up to 24 hours) each time a push arrives. If the old URL returns a 404, those subscribers do not receive notifications. Continue hosting the old file for at least one year while subscribers naturally migrate by revisiting your site. See the [migration guide](#migration-guide) and [Web push notifications not shown](./notifications-not-shown-web-push) guide.

### Can I host the service worker on a CDN or subdomain?

No. Browsers require service workers to be served from the same origin as the page that registers them. The file must be on your primary domain — not a CDN, subdomain, or different domain.

### Why does my PWA conflict with the OneSignal service worker?

Both are likely registered at root scope (`/`) and only one service worker can be active at a given scope. Move the OneSignal service worker to a subdirectory scope (e.g., `/push/onesignal/`) so your PWA retains control of root scope, or combine them as described in [Combining multiple service workers](#combining-multiple-service-workers).

### Can I rename the OneSignalSDKWorker.js file?

Yes. If your server requires a specific naming convention (e.g., all lowercase), rename the file to something like `onesignalsdkworker.js`. Update the filename in your OneSignal configuration — either the **Service worker filename** field in the dashboard or the `serviceWorkerPath` parameter in your `OneSignal.init()` call. See [Configure the SDK path](#step-4-configure-the-sdk-path-subdirectory-only) for details.

### What content type should my server return for the service worker file?

The server must return `Content-Type: application/javascript; charset=utf-8`. Some servers or CDN configurations return an incorrect MIME type, which causes the browser to reject the service worker registration.


> ## Documentation Index
> Fetch the complete documentation index at: https://documentation.onesignal.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Web push setup

> Set up web push notifications with OneSignal to re-engage Users across Chrome, Firefox, Safari, and Edge.

Web push notifications re-engage Users with timely content — even when they're not actively browsing your website. They support rich content including text, images, action buttons, and sounds.

<Frame caption="Web push notifications reach Users even when they're not on your site">
  <img src="https://mintcdn.com/onesignal/RWtLFPeffHrC81wI/images/docs/ac9092f6fd99acc866af2598470d3b4b6e8233d947e45d8aade0b8bfcea71c8f-channel-setup-web-push.jpg?fit=max&auto=format&n=RWtLFPeffHrC81wI&q=85&s=e73d6a84ca1e7ea2402ca3dc73d33f02" alt="Web push notification examples across different browsers and devices" width="1280" height="720" data-path="images/docs/ac9092f6fd99acc866af2598470d3b4b6e8233d947e45d8aade0b8bfcea71c8f-channel-setup-web-push.jpg" />
</Frame>

For web push to work:

* **HTTPS website**: Web push only works on secure sites with a valid SSL certificate
* **Service worker**: You must be able to add the [OneSignal service worker](./onesignal-service-worker) to your website
* **Single domain origin**: Must follow the [same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy)
* **User permission**: Users must explicitly grant permission to receive notifications
* **Supported browsers**: Works across most modern browsers (Chrome, Firefox, Safari, Edge)

<Warning>
  - **Incognito mode**: Users cannot subscribe while in incognito or private browsing mode.
  - **iOS**: Requires additional setup — see [Web push for iOS](./web-push-for-ios).
  - **Browser limits**: Some browsers may have notification limits or require user interaction — see [Web push FAQ](./web-push-setup-faq).
</Warning>

***

## Web push developer guides

Before sending web push notifications, complete the following setup steps.

<Note>
  Not a developer? See [Manage team members](./manage-team-members) to invite a teammate with developer access to your OneSignal project.
</Note>

<Columns cols={3}>
  <Card title="Web SDK setup" icon="browsers" href="./web-sdk-setup">
    Install and configure the OneSignal Web SDK, including localhost testing and permission prompts.
  </Card>

  <Card title="iOS web push setup" icon="apple" href="./web-push-for-ios">
    Follow Apple-specific steps to enable web push on iPhones and iPads running iOS 16.4+.
  </Card>

  <Card title="Migration from another provider" icon="arrow-right-arrow-left" href="./migrating-to-onesignal">
    Transition from another web push provider and retain your Subscriptions.
  </Card>

  <Card title="WordPress plugin" icon="plug" href="./wordpress">
    Integrate push notifications on WordPress using the official plugin — no coding required.
  </Card>

  <Card title="Shopify-Vendo integration" icon="shopify" href="./shopify">
    Integrate Shopify with OneSignal through the Vendo integration for web push, custom events, and customer identification.
  </Card>
</Columns>

***

## Configuration options

Set up your website for web push in the OneSignal dashboard under **Settings > Push & In-App > Web**.

<Frame caption="Activate the web platform in your OneSignal settings">
  <img src="https://mintcdn.com/onesignal/KPVdijCt4_xCbkO8/images/dashboard/web-push-platform-activation.png?fit=max&auto=format&n=KPVdijCt4_xCbkO8&q=85&s=beba7df5d3a4ad5545311951da0f03d2" alt="OneSignal dashboard showing web push platform activation in settings" width="1188" height="597" data-path="images/dashboard/web-push-platform-activation.png" />
</Frame>

Select the integration type that matches your site:

<Frame caption="Choose your integration type based on your website setup">
  <img src="https://mintcdn.com/onesignal/BK2J-grzBpDdh8NC/images/dashboard/web-push-integration-type-options.png?fit=max&auto=format&n=BK2J-grzBpDdh8NC&q=85&s=f74c4245d969d80db72268a865bcf899" alt="OneSignal dashboard showing integration type options: Typical Site, WordPress, and Custom Code" width="2668" height="1454" data-path="images/dashboard/web-push-integration-type-options.png" />
</Frame>

<Columns cols={3}>
  <Card title="Typical site" icon="globe" href="./web-sdk-setup">
    **Recommended** — Configure prompts, welcome notification, and service worker setup directly in the dashboard.
  </Card>

  <Card title="WordPress" icon="plug" href="./wordpress">
    Use the official OneSignal WordPress plugin and configure prompts and welcome notification directly in the dashboard.
  </Card>

  <Card title="Custom code" icon="code" href="./web-push-custom-code-setup">
    Full control for developers who want to customize everything via code.
  </Card>
</Columns>

Site details:

* **Site Name**: Used in default notification titles
* **Site URL**: Must exactly match your domain origin (no paths or `www` mismatch)
* **Auto Resubscribe**: Recommended — Automatically re-subscribes returning Users who cleared browser data
* **Default Icon URL**: `256x256px` image shown in notifications (if unset, a default bell icon is used)

### Auto resubscribe

If Users clear their browser data, they stop receiving push notifications. Enable this option to automatically re-subscribe Users when they return to your site. See [Subscriptions](./subscriptions) for more details.

<Frame caption="Web settings in the OneSignal dashboard">
  <img src="https://mintcdn.com/onesignal/uaUYB-ILUGPSRvKB/images/docs/web-push-site-settings.png?fit=max&auto=format&n=uaUYB-ILUGPSRvKB&q=85&s=893a536c16cb4c439bc8fe53892861da" alt="OneSignal dashboard web push configuration settings showing site details and auto resubscribe option" width="2072" height="712" data-path="images/docs/web-push-site-settings.png" />
</Frame>

***

### Web permission prompts

Customize when and how the notification permission prompt appears to maximize opt-in rates.

<Tip>
  Use clear messaging that explains the benefit, prompt Users at the right time (e.g., after engagement), and use a pre-prompt before triggering the native browser dialog.
</Tip>

<Columns cols={2}>
  <Card title="Web permission prompts" icon="bell" href="./permission-requests">
    Compare different prompt types (slidedown, category-based, native, subscription bell, and more).
  </Card>

  <Card title="Web SDK reference" icon="code" href="./web-sdk-reference">
    Programmatically control when and how prompts are shown using the SDK.
  </Card>
</Columns>

***

### Welcome notification

You can enable an optional confirmation push that's sent immediately after a User subscribes. Typical and WordPress integrations can set this in the dashboard.

<Frame caption="Welcome notifications confirm successful Subscription and demonstrate value">
  <img src="https://mintcdn.com/onesignal/Xl2NHJvxakrK4JbL/images/docs/f33b02284d74f534669e87edfc8cd23e6be06eb8e705f640fd96bd8b7292ff4d-Screenshot_2024-10-25_at_2.06.50_PM.png?fit=max&auto=format&n=Xl2NHJvxakrK4JbL&q=85&s=a70fc05fa5728334e75b95bbb276a923" alt="OneSignal dashboard showing welcome notification configuration with title, message, and URL fields" width="2072" height="728" data-path="images/docs/f33b02284d74f534669e87edfc8cd23e6be06eb8e705f640fd96bd8b7292ff4d-Screenshot_2024-10-25_at_2.06.50_PM.png" />
</Frame>

Custom Code integration uses the `welcomeNotification` object in the `OneSignal.init` function. See [Web SDK reference](./web-sdk-reference) for details.

**Why send welcome notifications?**

* Let Users know they've subscribed successfully
* Show what future notifications will look like
* Provide onboarding content or next steps

***

## Users and Subscriptions

When a User subscribes to push, OneSignal automatically creates a unique Subscription tied to their browser and device.

Web push Subscriptions are created when Users:

* Grant permission for push notifications on your website using a specific browser and device
* Return to your site after clearing browser data (if Auto Resubscribe is enabled)
* Subscribe from a new browser or device

<Note>
  Each browser/device combination creates a separate Subscription. Incognito/private browsing mode cannot create Subscriptions. Web push Subscriptions remain anonymous until you assign them an [External ID](./users#external-id).
</Note>

<Frame caption="OneSignal dashboard: Audience > Users">
  <img src="https://mintcdn.com/onesignal/ciRrThfP6xMpI7GY/images/dashboard/users-page.png?fit=max&auto=format&n=ciRrThfP6xMpI7GY&q=85&s=8992ef97cf3c9f336078f9dbf8a6374e" alt="OneSignal dashboard Users page showing a list of Users with Subscription details" width="2316" height="858" data-path="images/dashboard/users-page.png" />
</Frame>

<Columns cols={2}>
  <Card title="Users" icon="users" href="./users">
    Manage Users, assign External IDs, and track their activity.
  </Card>

  <Card title="Subscriptions" icon="address-book" href="./subscriptions">
    How Subscriptions work across browsers and devices.
  </Card>

  <Card title="Segments" icon="chart-pie" href="./segmentation">
    Group Users into Segments to target based on behavior, device, and more.
  </Card>
</Columns>

### iOS support

Apple added web push support for iPhones and iPads running iOS 16.4+ with stricter requirements:

* Users must add your site to their Home Screen
* Permission prompts are shown only after that step
* Notifications behave like native app alerts once enabled

<Columns cols={2}>
  <Card title="Web push for iOS" icon="apple" href="./web-push-for-ios">
    Step-by-step instructions to enable iOS support, including service worker and manifest setup.
  </Card>
</Columns>

***

## Design web push notifications

Web push notifications support titles, messages, icons, images, and action buttons. The diagram below shows which elements you can customize.

<Frame caption="Web push notification anatomy — customize elements 1–6, while 7–9 are controlled by the browser">
  <img src="https://mintcdn.com/onesignal/Z6xkXGfmy814If53/images/docs/dd4f79c-Web_Push_Examples.png?fit=max&auto=format&n=Z6xkXGfmy814If53&q=85&s=8d72d6952cd50f8c01a49ada61a15456" alt="Annotated diagram showing the anatomy of a web push notification with customizable and browser-controlled elements" width="1937" height="1359" data-path="images/docs/dd4f79c-Web_Push_Examples.png" />
</Frame>

**Customizable elements:**

1. [Title](./push#title): Attention-grabbing headline (recommended: under 50 characters)
2. [Message](./push#message): Main notification content (recommended: under 120 characters)
3. [Icon](./notification-icons): Your brand icon or notification-specific image (recommended: `256x256px` PNG or JPG)
4. [Large image](./push#image): Eye-catching visual content
5. [Action buttons](./action-buttons): Call-to-action buttons

**Browser-controlled elements (not customizable):**
6\. Browser: The browser/app displaying the push
7\. Domain: Your site origin, automatically set by the browser
8\. Timestamp and dismiss: Browser-added controls
9\. More options: Browser-specific additional controls

<Columns cols={2}>
  <Card title="Push overview" icon="bell" href="./push">
    Full overview of push notification creation, options, and delivery behavior.
  </Card>

  <Card title="Templates" icon="clone" href="./templates">
    Save time with reusable templates for consistent messaging.
  </Card>
</Columns>

### Personalization and localization

Customize push messages to match each User's preferences and language.

<Columns cols={2}>
  <Card title="Message personalization" icon="wand-magic-sparkles" href="./message-personalization">
    Insert dynamic variables like name or preferences to tailor messages.
  </Card>

  <Card title="Multi-language messaging" icon="language" href="./multi-language-messaging">
    Deliver messages in each User's preferred language.
  </Card>
</Columns>

***

## Configure web push behavior

Control how your push messages behave after sending — when they appear, how long they're stored, and how Users interact.

### Delivery, display, and dismiss settings

<Columns cols={2}>
  <Card title="Throttling" icon="gauge-high" href="./throttling">
    Control notification delivery speed.
  </Card>

  <Card title="Frequency capping" icon="hand" href="./frequency-capping">
    Set limits to prevent over-sending notifications to the same User.
  </Card>

  <Card title="Time to live (TTL)" icon="clock" href="./push#time-to-live-ttl">
    Define how long push services retain messages when the device is offline.
  </Card>

  <Card title="Web push topic" icon="layer-group" href="./push#web-push-topic-web-push">
    Use topics to group, replace, or suppress duplicate notifications.
  </Card>
</Columns>

### Click behavior

Control what happens when a User clicks a notification.

**By default:** Clicking opens your homepage.

**Customize it:**

* Direct Users to a specific URL
* Use UTM tracking
* Suppress default behavior with `?_osp=do_not_open`

<Columns cols={2}>
  <Card title="URLs, links, and deep linking" icon="link" href="./links">
    Route Users to relevant content or pages using deep links and tracking.
  </Card>

  <Card title="Action buttons" icon="hand-pointer" href="./action-buttons">
    Let Users take immediate actions from your notification.
  </Card>

  <Card title="Web SDK push event listeners" icon="code" href="./web-sdk-reference#push-notifications">
    Listen for click events and trigger in-app behavior with custom code.
  </Card>
</Columns>

***

## Test your setup

Before launching, thoroughly test your web push implementation across devices and browsers.

### Pre-launch checklist

* SDK is correctly loaded with no console errors
* Permission prompt appears and functions correctly
* Test notification is sent and received
* Icons and images render correctly
* Service worker is registered and up to date
* HTTPS certificate is valid

### Analytics and troubleshooting

Measure notification performance and resolve common delivery issues.

<Columns cols={2}>
  <Card title="Push message reports" icon="chart-line" href="./push-notification-message-reports">
    View delivery, open rate, and click-through metrics for each message.
  </Card>

  <Card title="Analytics overview" icon="chart-bar" href="./analytics-overview">
    Explore engagement and User behavior metrics across channels.
  </Card>

  <Card title="Notifications not shown or delayed" icon="circle-exclamation" href="./notifications-not-shown-web-push">
    Troubleshooting checklist if messages aren't appearing.
  </Card>

  <Card title="Notification images not showing" icon="image" href="./notification-images-not-showing">
    Fix image rendering issues across different browsers.
  </Card>
</Columns>

***

## Next steps

<Columns cols={2}>
  <Card title="A/B testing" icon="flask" href="./ab-testing">
    Optimize messages with experiments to find what drives engagement.
  </Card>

  <Card title="Journeys" icon="route" href="./journeys-overview">
    Build automated, multi-step messaging flows triggered by User behavior.
  </Card>

  <Card title="Tags" icon="tags" href="./add-user-data-tags">
    Add User-level data for personalization and targeting.
  </Card>
</Columns>

***

## FAQ

### Can Users subscribe to web push on iOS?

Yes, starting with iOS 16.4+. Users must first add your website to their Home Screen, then grant notification permission. See [Web push for iOS](./web-push-for-ios) for the full setup steps.

### Why did a User stop receiving web push notifications?

The most common cause is that the User cleared their browser data, which removes the push Subscription. Enable **Auto Resubscribe** in your web push settings to automatically re-subscribe returning Users. See [Subscriptions](./subscriptions) for details.

### Do web push notifications work in incognito or private browsing mode?

No. Users cannot subscribe to web push while in incognito or private browsing mode. Subscriptions created in a normal session are not accessible in private mode.

### What browsers support web push notifications?

Chrome, Firefox, Safari (macOS and iOS 16.4+), and Edge all support web push. Each browser may have different prompt behavior and notification display. See [Web push FAQ](./web-push-setup-faq) for browser-specific details.

### Can I use subdomains with web push?

Each subdomain (e.g., `app.example.com` vs `shop.example.com`) is a separate origin. Browsers enforce the [same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy) for web push, so each subdomain requires its own OneSignal App. The service worker must also be hosted on the same origin as the subscribing page — CDNs and other subdomains are not allowed. See [Multiple sites & subdomains](./web-push-setup-faq#multiple-sites--subdomains) for setup options.

### How do I register more than one domain for web push?

You need a separate OneSignal app for each domain or subdomain. A single OneSignal app can only serve one origin. To manage multiple domains, either redirect Users to a single origin for subscription or create individual OneSignal apps per origin. See [Multiple sites & subdomains](./web-push-setup-faq#multiple-sites--subdomains) for detailed strategies.

### Why is my web push prompt not showing?

Common causes include: the site is not served over HTTPS, the service worker is not registered correctly, the User already granted or denied permission, or the User is in incognito mode. Check the browser console for errors and see [Notifications not shown](./notifications-not-shown-web-push) for a full checklist.

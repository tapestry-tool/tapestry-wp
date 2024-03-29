# tapestry-wp

[![tapestry-wp](https://img.shields.io/endpoint?url=https://dashboard.cypress.io/badge/simple/h3nrkv/master&style=flat&logo=cypress)](https://dashboard.cypress.io/projects/h3nrkv/runs)

This is a plugin for Wordpress that allows creating non-linear, collaborative, and interactive content. This plugin adds a new post type to Wordpress called "Tapestry" and allows presentation and authoring in the frontend using Vue JS.

Visit [tapestry-tool.com](https://www.tapestry-tool.com) for more info.

## How to install this plugin for Wordpress

You can visit the [releases](https://github.com/tapestry-tool/tapestry-wp/releases) page in this repository and find the plugin zip file under the "Assets" toggle for a given version. Once downloaded, you can upload this zip file to Wordpress under Plugins > Add New > Upload Plugin and activate the plugin.

## Development

The Vue application is loaded in the tapestry post type template under `templates/single-tapestry.php`. It is located in the `templates/vue` directory.

### Requirements

The Vue application requires node v16 (or higher). Before running any of the commands below, you must either set your node version globally or run `nvm use`.

### Local Development

To get started with developing locally:

- Clone this repo into a directory called `tapestry` under your Wordpress directory in the plugins folder (`wp-content/plugins`)
- Setup your local dev environment. You have 2 options for your local development:
  1. _Using LAMP/MAMP/WAMP:_ Follow the detailed instruction for [Mac, Windows](https://github.com/tapestry-tool/tapestry-wp/wiki/Local-Dev-with-MAMP-or-WAMP), or [Linux](https://github.com/tapestry-tool/tapestry-wp/wiki/Local-Dev-with-LAMP-setup).
  2. _Using Docker:_ Follow the detailed [Docker Installation & Usage](https://github.com/tapestry-tool/tapestry-wp/wiki/Docker-Installation-&-Usage) wiki page.
- Edit your Wordpress `wp-config.php` file and add the following line right above the comment "That's all, stop editing!":
  ```
  define('TAPESTRY_USE_DEV_MODE', true);
  ```
- Follow the steps below under "Getting external links to work"
- In the `templates/vue` directory, run `npm start` to serve with hot reload at localhost:8080

### Build & Deployment

To build a new plugin zip file with your local edits:

- CD into the `templates/vue` directory and run: `npm install && npm run build`
- Edit your Wordpress `wp-config.php` file and set `TAPESTRY_USE_DEV_MODE` to false if it exists (no action needed if that setting doesn't exist)
- You can safely delete:
  - All hidden files in the root directory
  - All files and directories in the `templates/vue` directory except the `dist` folder
- Zip the `tapestry` folder and upload it in your other Wordpress instance under Plugins > Add New > Upload Plugin

### Getting external links to work (RECOMMENDED)

It's strongly recommended you complete this to get link previews working for the "External Link" content type. To do this, you will need to get an API key for LinkPreview and set a config variable first by following these instructions:

1. Navigate to [linkpreview.net](https://www.linkpreview.net/) and sign up to get an API Key
2. Once logged in, press "Generate new access key" on the top right corner and copy the key
3. In the `templates/vue` directory, create a `.env` file containing the following line:
   ```
   LINK_PREVIEW_API_KEY=<key>
   ```
   where `<key>` is the key you generated.

If you complete these steps before running `npm run build`, you will have link previews working.

### Changing videos to upload to Kaltura instead of localhost (OPTIONAL)

Do you have access to Kaltura and want to offload your videos to be saved there instead of Wordpress? If so, you can follow these instructions to do so:

1. Run `composer install` in the tapestry plugin root folder. If successful, you will be able to see a `vendor` folder containing `kaltura`.

2. Edit your Wordpress `wp-config.php` file and add the following lines right above the comment "That's all, stop editing! Happy publishing":
   ` define('KALTURA_ADMIN_SECRET', ''); define('KALTURA_PARTNER_ID', ''); define('KALTURA_SERVICE_URL', ''); define('KALTURA_UNIQUE_CONFIG', ''); `
   The Kaltura Admininstrator Secret and Partner ID can be found by going to your Kaltura Settings > Integration tab in the Kaltura admin. The service URL is simply the main domain where your Kaltura videos are hosted on. The Kaltura Unique Configuration sets the media player design. It can be found in the Studio tab.

3. Note the following PHP configurations affect file uploading and HTTP request execution time limits on the server. This might be relevant for Kaltura and regular file upload as well. We recommend you find your active `php.ini` file and edit the following configurations:
   ```
   post_max_size =
   upload_max_filesize =
   max_execution_time =
   ```
   In case of an HTTPS/SSL error troubleshoot with the following ([source](https://stackoverflow.com/questions/28858351/php-ssl-certificate-error-unable-to-get-local-issuer-certificate)):

```
// Download the cacert.pem file from here: https://curl.se/docs/caextract.html and move it into C:/MAMP
// make sure this is uncommented
extension=php_openssl.dll
// Add these configuration lines
[SSL]
curl.cainfo="route/to/mamp/cacert.pem"
openssl.cafile="route/to/mamp/cacert.pem"
```

You should now be able to upload videos onto Kaltura.

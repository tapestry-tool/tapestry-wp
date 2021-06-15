# tapestry-wp

This is a plugin for Wordpress that allows creating non-linear, collaborative, and interactive content. This plugin adds a new post type to Wordpress called "Tapestry" and allows presentation and authoring in the frontend using Vue JS.

Visit [tapestry-tool.com](https://www.tapestry-tool.com) for more info.

## How to install this plugin for Wordpress

You can visit the [releases](https://github.com/wynnset/tapestry-wp/releases) page in this repository and find the plugin zip file under the "Assets" toggle for a given version. Once downloaded, you can upload this zip file to Wordpress under Plugins > Add New > Upload Plugin and activate the plugin.

## Development

The Vue application is loaded in the tapestry post type template under `templates/single-tapestry.php`. It is located in the `templates/vue` directory.

### Local Development

To get started with developing locally:
- Clone this repo into a directory called `tapestry` under your Wordpress directory in the plugins folder (`wp-content/plugins`)
- Setup your local dev environment. You have 2 options for your local development:
  1. *Using LAMP/MAMP/WAMP:* Follow the detailed instruction for [Mac, Windows](https://github.com/wynnset/tapestry-wp/wiki/Getting-Started-(Mac-&-Windows)), or [Linux](https://github.com/wynnset/tapestry-wp/wiki/Getting-Started-on-Arch-Linux).
  2. *Using Docker:* Follow the detailed [Docker Installation & Usage](https://github.com/wynnset/tapestry-wp/wiki/Docker-Installation-&-Usage) wiki page.
- Follow the steps below under "Getting external links to work"
- Optional: Follow the steps below under "Changing videos to upload to Kaltura instead of localhost"
- Make sure `$TAPESTRY_USE_DEV_MODE` is set to `TRUE` in `tapestry.php`
- In the `templates/vue` directory, run `npm start` to serve with hot reload at localhost:8080

### Build & Deployment

To build a new plugin zip file with your local edits:
- CD into the `templates/vue` directory and run: `npm install && npm run build`
- Open up `tapestry.php` and set `$TAPESTRY_USE_DEV_MODE` to `FALSE`
- You can safely delete:
  - All hidden files in the root directory
  - All files and directories in the `templates/vue` directory except the `dist` folder
- Zip the `tapestry` folder and upload it in your other Wordpress instance under Plugins > Add New > Upload Plugin

### Getting external links to work

It's strongly recommended you complete this to get link previews working for the "External Link" content type. To do this, you will need to get an API key for LinkPreview and set a config variable first by following these instructions:

1. Navigate to [linkpreview.net](https://www.linkpreview.net/) and sign up to get an API Key
2. Once logged in, press "Generate new access key" on the top right corner and copy the key
3. In the `templates/vue` directory, create a `.env` file containing the following line:
    ```
    LINK_PREVIEW_API_KEY=<key>
    ```
    where `<key>` is the key you generated.

If you complete these steps before running `npm run build`, you will have link previews working.

### Changing videos to upload to Kaltura instead of localhost

You may optionally set uploaded videos in Tapestry to upload to Kaltura (if you have access to the Kaltura platform) by following these instructions:

1. In your wordpress root directory, run `composer install`. If successful, you will be able to see a `vendor` folder containing `kaltura`.
2. Edit your Wordpress `wp-config.php` file and add the following lines right above the comment "That's all, stop editing! Happy publishing":
    ```
    define('KALTURA_ADMIN_SECRET', '');
    define('KALTURA_PARTNER_ID', '');
    define('KALTURA_SERVICE_URL', '');
    ```
3.Note the following wp variables as they can effect file uploading and HTTP request execution time limits in the WordPress server. This might be relevant for Kaltura and regular file upload as well.
  File: `php.ini` or `php.conf.ini`
  Variables of interest:
    ```
    post_max_size = 
    upload_max_filesize =
    max_execution_time =
    ```
  In case of an HTTPS/SSL error troubleshoot with the following - https://stackoverflow.com/questions/28858351/php-ssl-certificate-error-unable-to-get-local-issuer-certificate
    ```
    // Download the cacert.pem file from here: https://curl.se/docs/caextract.html and move it into C:/MAMP
    // make sure this is uncommented
    extension=php_openssl.dll

    // Add these configuration lines
    [SSL]
    curl.cainfo="C:/MAMP/cacert.pem"
    openssl.cafile="C:/MAMP/cacert.pem"
    ```


The Kaltura Admininstrator Secret and Partner ID can be found by going to your Kaltura Settings > Integration tab in the Kaltura admin. The service URL is simply the main domain where your Kaltura videos are hosted on.

You should now be able to upload videos onto Kaltura.

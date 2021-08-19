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
- Make sure `$TAPESTRY_USE_DEV_MODE` is set to `TRUE` in `tapestry.php`
- In the `templates/vue` directory, run `npm start` to serve with hot reload at localhost:8080

**IMPORTANT NOTES ON USING DOCKER:** 
*By default, Docker containers only accepts internet traffic from the host machine.* This means any LAN devices cannot access the tapestry website hosted using Docker without additional setup. This may limit your ability to test tapestry using other devices (mobile devices connected to LAN).

In addition, Docker outputs PHP error logs to `docker.stderr` by default. Meaning you can only view PHP error logs by viewing the docker container logs. **This behaviour is hardcoded by Docker, and it can make debugging the PHP backend tricky as the PHP prints will not be visible.** You can view the docker container logs (and the PHP errors) by doing `docker logs -f [CONTAINER_ID]` while the container is running. Learn more about this workaround [by clicking here](https://carlosguzman.dev/how-to-see-the-error-logs-in-wordpress-with-docker-in-linux/).

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

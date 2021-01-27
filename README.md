# tapestry-wp

This is a plugin for Wordpress that allows creating non-linear, collaborative, and interactive content. 

Visit [tapestry-tool.com](https://www.tapestry-tool.com) for more info

## Usage

To install this plugin locally:
- Ensure you have Wordpress installed locally
- Clone this repo into a directory called `tapestry` under your Wordpress directory in the plugins folder (`wp-content/plugins`)
- Follow the steps below under "Getting External Links to Work"
- CD into the `templates/vue` directory and enter: `npm install && npm run build`
- Open up `tapestry.php` and set `$TAPESTRY_USE_DEV_MODE` to `FALSE`

To export this plugin to use on a non-local Wordpress instance:
- Follow the steps above to install the plugin locally
- Make a copy of this `tapestry` folder that you have locally and call it `tapestry-deploy`
- In `tapestry-deploy` folder, delete all hidden files in the root
- CD into `templates/vue` folder and delete every file except the `dist` folder
- Zip the `tapestry-deploy` folder and upload it in your other Wordpress instance under Plugins > Add New > Upload Plugin

### Getting External Links to Work

It's strongly recommended you complete this to get link previews working for the "External Link" content type. To do this, you will need to get an API key for LinkPreview and set a config variable first by following these instructions:

1. Navigate to [linkpreview.net](https://www.linkpreview.net/) and sign up to get an API Key
2. Once logged in, press "Generate new access key" on the top right corner and copy the key
3. In the `templates/vue` directory, create a `.env` file containing the following line:
    ```
    LINK_PREVIEW_API_KEY=<key>
    ```
    where <key> is the key you generated.

If you complete these steps before running `npm run build`, you will have link previews working

## Development

Tapestry plugin uses 2 main JavaScript technologies:

- D3 JS (used for node rendering)
- Vue JS (used for all frontend design and logic. See `templates/vue` folder, which is the root of the tapestry application)

Both of these are loaded in the Tapestry page template under `templates/single-tapestry.php`

To do development:
- Follow the steps above to install the plugin locally
- Make sure `$TAPESTRY_USE_DEV_MODE` is set to `TRUE` in `tapestry.php`
- Get the Wordpress backend running using either a **MAMP** stack or [Docker](#docker)
- In the `templates/vue` directory, run `npm run dev` to serve with hot reload at localhost:8080


## Docker
TODO

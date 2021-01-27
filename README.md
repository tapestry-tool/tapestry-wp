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

For a Quick-Start alternative, consider using [Docker](#docker).

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
Docker can be used to encapsulate and simplify our dependency structure and speed up the process of running the WordPress instance. It is theoretically suitable for both development and production environments.
### General Steps
1. Make sure you have [installed Docker](https://docs.docker.com/get-docker/) for your host system, and cloned the branch of this repository you want to run. **Note**: the following steps assume that your system has a standard version of the **make** command installed, but the provided `Makefile` simply provides convenient aliases to standard shell commands, so these can be easily adapted if you do wish to use **make**.
2. In the root of the repository, run
    ```
    > make init
    ```
    This will start up the required containers, then set up the WP installation with starting data, such as plugins and users.
    Notes:
    - You may see an error related to connecting to the database, which means that the containers were not ready when we tried to install the data. In this case, run `make stop` then follow [these steps.](#setting-container-wait-time)
    - When prompted for your Link Preview Key, enter the value you obtained in the [steps above](#getting-external-links-to-work). The script will create the `.env` file for you.
3. If you completed the previous step successfully, you should have a WP instance running on `localhost`. You can now run the Tapestry app from the `templates/vue` directory (see `make start-app`).
4. When you are finished, make sure to run `make stop` to close the containers. This will also shut down the running node application if it is still running.

### Setting Container Wait-Time
If your machine is low on resources, or you have a lot of containers running, you may find that container start-up takes to long and prevents the install script from executing properly. The simple fix is to increase the amount of time the script waits:
1. Run `make stop` to bring down all containers and processes.
2. Copy the file `bin/config-sample.sh` to `bin/config.sh`.
3. In the file you just created, set the wait time to some bigger number, and try running your command again.

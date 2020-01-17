# tapestry-d3-vue

> A Vue.js project

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```

For detailed explanation on how things work, consult the [docs for vue-loader](http://vuejs.github.io/vue-loader).

## Link Preview API Key

To get link previews working for the "External Link" content type, you will need to get an API key for LinkPreview and set a config variable first by following these instructions:

1. Navigate to [linkpreview.net](https://www.linkpreview.net/) and sign up to get an API Key
2. Once logged in, press "Generate new access key" on the top right corner and copy the key
3. In this directory (vue), make a copy of the `config-sample.js` file and rename it to `config.js` (if it doesn't exist yet)
4. Open the `config.js` file and paste the API key as the value of the `LINK_PREVIEW_API_KEY` variable

## Git Config

You need to adjust your git config so the automatic linting process works correctly. To do this run the following command:

```
git config core.hooksPath .githooks
```

## Testing Setup

The testing framework that we use, Cypress, needs to be configured with some environment variables. In the `cypress.json` file, you should see something like:

```json
{
    "env": {
        "DEV_URL": "http://localhost:8888",
        "TEST_TAPESTRY_NAME": "testing",
        "USER_TAPESTRY_NAME": "testing-user",
        "ADMIN_USERNAME": "admin",
        "ADMIN_PASSWORD": "Tapestry123!",
        "SUBSCRIBER_USERNAME": "narendras",
        "SUBSCRIBER_PASSWORD": ")%AbNZgppS)uNvxT5)OdgzhX"
    }
}
```

Change the variables to match your own settings.

* `DEV_URL` is the url of your local site.
* `TEST_TAPESTRY_NAME` is the name of a new tapestry that is automatically made (and deleted) during the authoring tests.
* `USER_TAPESTRY_NAME` is the name of the tapestry that is used for the user-side tests.
* `ADMIN_USERNAME` is the name of a user in your Wordpress that has admin privileges.
* `ADMIN_PASSWORD` is the password of the above user.
* `SUBSCRIBER_USERNAME` is the name of a user in your Wordpress that has subscriber privileges.
* `SUBSCRIBER_PASSWORD` is the password of the above user.

Once that is done, run the following command to open the test GUI:

```
npm install && npm run test:open
```

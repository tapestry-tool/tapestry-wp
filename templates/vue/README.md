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
If you run into node dependency errors such as ```Error: spawn webpack ENOENT```
1. delete the node module package (```../templates/vue/node_modules```) 
2. run ```npm install``` 


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

### End-to-End Testing

Cypress is the framework we use for end-to-end (e2e) testing. For it to work, it needs to be configured with some environment variables. In the `cypress-sample.json` file, you should see something like:

```json
{
    "env": {
        "BASE_URL": "http://localhost:8888",
        "USER_TAPESTRY_NAME": "testing-user",
        "ADMIN_USERNAME": "admin_user",
        "ADMIN_PASSWORD": "admin_pass",
        "SUBSCRIBER_USERNAME": "subscriber_user",
        "SUBSCRIBER_PASSWORD": "subscriber_pass"
    }
}
```

Copy the file to `cypress.json` and change the variables to match your own settings.

* `BASE_URL` is the url of your local site.
* `USER_TAPESTRY_NAME` is the name of the tapestry that is used for the user-side tests.
* `ADMIN_USERNAME` is the name of a user in your Wordpress that has admin privileges.
* `ADMIN_PASSWORD` is the password of the above user.
* `SUBSCRIBER_USERNAME` is the name of a user in your Wordpress that has subscriber privileges.
* `SUBSCRIBER_PASSWORD` is the password of the above user.

Once that is done, run the following command to open the test GUI:

```
npm install && npm run test:open
```

### Integration Testing

For integration tests we use [Vue Testing Library](https://github.com/testing-library/vue-testing-library). It's an awesome library that encourages accessible practices and robust tests by not letting you [test implementation details](https://kentcdodds.com/blog/testing-implementation-details).

Unlike Cypress, Vue Testing Library should work out of the box. To run the tests, run the following command:

```bash
npm run test:jest
```

On top of running the tests, this command also generates a code coverage report that you can open by running:

```bash
npm run report:jest
```

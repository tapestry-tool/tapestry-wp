// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

module.exports = (on, config) => {
  require("@cypress/code-coverage/task")(on, config)
  on("file:preprocessor", require("@cypress/code-coverage/use-browserify-istanbul"))
  on("task", {
    /*
      Register the ability to print to the console during Cypress tests, to help debug
      To log a debug message, use:
        cy.task("log", "Print this to the console")
    */
    log(message) {
      console.log(message)
      return null
    },
  })
  return config
}

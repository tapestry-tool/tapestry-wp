// TODO: Add node generator
// TODO: Add link generator

export const SITE_URL = 'http://localhost:8888'

export const API_URL = `${SITE_URL}/wp-json/tapestry-tool/v1`

/**
 * Returns the url of the given tapestry name. This should be a
 * tapestry that exists, otherwise the test will 404.
 *
 * @param {string} name name of the tapestry
 */
export const getTapestryUrl = name => `${SITE_URL}/tapestry/${name}`

export const getStore = () => cy.window().its('app.$store')

export const visitTapestry = (name = "empty") => cy.visit(getTapestryUrl(name))

export const fillNodeForm = fixture => {
  cy.get(fixture)
    .then(data => {
      cy.get("#node-title").type(data.title)
      cy.get("#node-description").type(data.description)
      cy.get("#node-media-type").select(data.mediaType)
      cy.get("#node-text-content").type(data.typeData.textContent)
      cy.contains("Submit").click()
    })
}

export const addRootNode = fixture => {
  cy.get("#root-node-button > div").click()
  fillNodeForm(fixture)
}

export const generateLink = (source, target) => ({ source, target })

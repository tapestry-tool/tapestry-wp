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

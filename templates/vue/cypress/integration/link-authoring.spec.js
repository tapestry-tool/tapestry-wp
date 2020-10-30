describe("Link Authoring", () => {
  /**
   * Currently, d3-drag (which handles our drag events) and Cypress are incompatible.
   * See:
   *  - https://github.com/cypress-io/cypress/issues/311
   *  - https://stackoverflow.com/questions/54027884/testing-d3-js-drag-events-with-cypress-js
   *
   * We can potentially test this still using Jest and Vue-Testing-Lib:
   *  - https://github.com/wynnset/tapestry-wp/pull/767
   */
  describe.skip("Linking", () => {
    it(`
      Given: Two unlinked leaf nodes
      When: The add button is dragged from one to the other
      Then: A confirmation should appear that, when confirmed, adds the link
    `)

    it(`
      Given: The link confirmation modal
      When: The cancel button is pressed
      Then: The link should not be created
    `)

    it(`
      Given: Two linked nodes
      When: A link is added
      Then: The link should not be created
    `)

    it(`
      Given: Two nodes, one without add permission
      When: A link is added
      Then: An alert should appear and the link not created
    `)

    it(`
      Given: An accordion node and a regular node
      When: A link is added from the accordion to the node
      Then: A confirmation should appear that, when confirmed, adds the node as a row
    `)

    it(`
      Given: An accordion node and a regular node
      When: A link is added from the accordion to the node
      Then: A confirmation should appear that, when cancelled, adds only the link
    `)
  })

  describe("Deletion", () => {
    it(`
      Given: Two linked leaf nodes
      When: Their link is clicked
      Then: A confirmation should appear that, when confirmed, deletes the link
    `)

    it(`
      Given: A leaf node with only one link
      When: The link is clicked
      Then: An alert should appear and the link not deleted
    `)

    it(`
      Given: Two linked nodes, one without add permission
      When: The link is clicked
      Then: An alert should appear and the link not deleted
    `)

    it(`
      Given: An accordion node and its row
      When: The link is deleted
      Then: The row should be removed from the accordion
    `)
  })
})

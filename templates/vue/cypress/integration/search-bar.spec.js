const assertVisibleNodes = visibleNodes => {
  cy.store()
    .its("state.nodes")
    .then(nodes => {
      for (const node of Object.values(nodes)) {
        cy.getNodeById(node.id)
          .should("have.css", "opacity")
          .and(opacity => {
            const opacityAsNum = Number(opacity)
            if (visibleNodes.includes(node.id)) {
              expect(opacityAsNum).to.equal(1)
            } else {
              expect(opacityAsNum).to.be.lessThan(1)
            }
          })
      }
    })
}

describe("Search bar", () => {
  beforeEach(() => {
    cy.fixture("multi-author.json").as("tapestry")
    cy.setup("@tapestry")
  })

  it("should be able to search nodes via different attributes", () => {
    cy.store()
      .its("state.nodes")
      .then(nodes => {
        const allNodes = Object.values(nodes)
        assertVisibleNodes(allNodes.map(node => node.id))

        cy.get("[aria-label=search]").click()
        assertVisibleNodes([])

        // By title
        cy.findByPlaceholderText("Node title").type("first")
        let expected = allNodes.filter(node => node.title.startsWith("first"))
        assertVisibleNodes(expected.map(node => node.id))

        // By author
        cy.findByDisplayValue("Title").select("Author")
        cy.findByPlaceholderText("Node author").type("admin")
        expected = Object.values(nodes).filter(node => node.author.name === "admin")
        assertVisibleNodes(expected.map(node => node.id))

        /**
         * TODO: By status -- waiting for #680 to be merged in
         *  - https://github.com/wynnset/tapestry-wp/pull/683
         */
        cy.findByDisplayValue("Author").select("Status")
      })
  })
})

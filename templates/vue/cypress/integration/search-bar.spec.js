const assertVisibleNodes = visibleNodes => {
  const expected = visibleNodes.map(node => node.id)
  cy.store()
    .its("state.nodes")
    .then(nodes => {
      for (const node of Object.values(nodes)) {
        cy.getNodeById(node.id)
          .should("have.css", "opacity")
          .and(opacity => {
            const opacityAsNum = Number(opacity)
            if (expected.includes(node.id)) {
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
  })

  it("should be able to search nodes via different attributes", () => {
    cy.setup("@tapestry")

    cy.store()
      .its("state.nodes")
      .then(nodes => {
        const allNodes = Object.values(nodes)
        assertVisibleNodes(allNodes)

        cy.get("[aria-label=search]").click()
        assertVisibleNodes([])

        // Should update while typing
        cy.findByPlaceholderText("Node title").type("fir")
        let expected = allNodes.filter(node => node.title.startsWith("fir"))
        assertVisibleNodes(expected)

        // Should be search by title
        cy.findByPlaceholderText("Node title").type("st{enter}")
        expected = allNodes.filter(node => node.title.startsWith("first"))
        assertVisibleNodes(expected)

        // By author
        cy.findByDisplayValue("Title").select("Author")
        cy.findByPlaceholderText("Node author").type("admin{enter}")
        expected = Object.values(nodes).filter(node => node.author.name === "admin")
        assertVisibleNodes(expected)

        /**
         * TODO: By status -- waiting for #680 to be merged in
         *  - https://github.com/wynnset/tapestry-wp/pull/683
         */
        cy.findByDisplayValue("Author").select("Status")
        cy.findByDisplayValue("All").should("be.visible")
        assertVisibleNodes(allNodes)
      })
  })

  it("should be able to visit a url and see search results", () => {
    cy.setup("@tapestry")

    cy.store()
      .its("state.nodes")
      .then(nodes => {
        cy.app().then(app => {
          app.$router.push({
            path: app.$route.path,
            query: {
              search: "Title",
              q: "first node",
            },
          })
        })

        const expected = Object.values(nodes).filter(
          node => node.title === "first node"
        )
        assertVisibleNodes(expected)
      })
  })

  it("should not be able to visit the url if not authorized", () => {
    cy.setup("@tapestry", "subscriber")

    cy.app().then(app => {
      const { path } = app.$route
      app.$router.push({
        path,
        query: {
          search: "Title",
          q: "first node",
        },
      })

      cy.url().should("be.equal", path)
      cy.contains(
        `You don't have access to the search bar for this Tapestry.`
      ).should("be.visible")
    })
  })
})

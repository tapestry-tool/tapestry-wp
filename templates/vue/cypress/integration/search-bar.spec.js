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
        cy.getByTestId("search-input")
          .findByRole("combobox")
          .type("fir")
        let expected = allNodes.filter(node => node.title.startsWith("fir"))
        assertVisibleNodes(expected)

        // Should be search by title
        cy.getByTestId("search-input")
          .findByRole("combobox")
          .type("st{enter}")
        expected = allNodes.filter(node => node.title.startsWith("first"))
        assertVisibleNodes(expected)

        // By author
        cy.findByDisplayValue("Title").select("Author")
        cy.getByTestId("search-input")
          .findByRole("combobox")
          .click()
        cy.focused()
          .clear()
          .type("admin{enter}")
        expected = Object.values(nodes).filter(node => node.author.name === "admin")
        assertVisibleNodes(expected)

        cy.findByDisplayValue("Author").select("Status")
        cy.findByDisplayValue(/all/i).should("be.visible")
        assertVisibleNodes(allNodes)
      })
  })

  it.skip("should be able to search nodes via node status")

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

      cy.url().should(url => expect(url.endsWith(path)).to.be.true)
      cy.contains(
        `You don't have access to the search bar for this Tapestry.`
      ).should("be.visible")
    })
  })

  it.skip("should only show authors of public contributions")
})

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

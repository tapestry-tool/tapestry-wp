describe("Authoring", () => {
  const setup = (title, fixture) => {
    cy.login("admin")
    if (fixture) {
      cy.get(fixture).then(tapestry => {
        cy.addTapestry(title, tapestry).visitTapestry(title)
      })
    } else {
      cy.addTapestry(title).visitTapestry(title)
    }
  }

  const cleanup = title => {
    cy.deleteTapestry(title)
  }

  describe("Basic node management", () => {
    beforeEach(() => {
      cy.fixture("authoring/node-management/root.json").as("oneNode")
      cy.fixture("authoring/node-management/two-nodes.json").as("twoNodes")
    })

    const title = `cypress-node-management`

    it("Should be able to add and see a root node", () => {
      setup(title)

      const node = {
        title: "Root",
        description: "I am a root node",
        mediaType: "text",
        textContent: "Abcd",
      }
      cy.addNode(node).should("exist")
      cy.contains(node.title).should("exist")

      cleanup(title)
    })

    it("Should be able to open edit modal", () => {
      setup(title, "@oneNode")

      cy.getNodeByIndex(0)
        .editNode()
        .should("exist")

      cleanup(title)
    })

    it("Should be able to open add modal", () => {
      setup(title, "@oneNode")

      cy.getNodeByIndex(0)
        .addNode()
        .should("exist")

      cleanup(title)
    })

    it("Should be able to add child nodes", () => {
      setup(title, "@oneNode")

      const nodes = [
        {
          title: "Child 1",
          description: "I am a child 1",
          mediaType: "text",
          textContent: "Abcd",
        },
        {
          title: "Child 2",
          description: "I am a child 2",
          mediaType: "text",
          textContent: "Abcd",
        },
      ]

      for (const node of nodes) {
        cy.getNodeByIndex(0)
          .addNode(node)
          .should("exist")
        cy.contains(node.title).should("exist")
      }

      cleanup(title)
    })

    it("Should be able to open add modal", () => {
      setup(title, "@oneNode")

      cy.getNodeByIndex(0)
        .addNode()
        .should("exist")

      cleanup(title)
    })

    it("Should be able to delete a leaf node", () => {
      setup(title, "@twoNodes")

      cy.getNodeByIndex(1).deleteNode()
      cy.getNodeByIndex(1).should("not.exist")

      cleanup(title)
    })
  })
})

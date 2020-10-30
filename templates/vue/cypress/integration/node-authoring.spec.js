describe("Node Authoring", () => {
  beforeEach(() => {
    cy.fixture("one-node.json").as("oneNode")
    cy.fixture("two-nodes.json").as("twoNodes")
  })

  it("should be able to add a root node using the node modal", () => {
    cy.setup()

    const node = {
      title: "Root",
      description: "I am a root node",
      mediaType: "text",
      textContent: "Abcd",
    }

    cy.getByTestId(`root-node-button`).click()
    cy.getByTestId(`node-title`).type(node.title)
    cy.contains(/add description/i).click()
    cy.getEditable(`node-description`).type(node.description)

    cy.getByTestId(`node-media-type`).select(node.mediaType)
    cy.getEditable(`node-text-content`).type(node.textContent)

    cy.submitModal()

    cy.contains(node.title).should("exist")
    cy.store()
      .its("state.nodes")
      .then(nodes => {
        expect(Object.keys(nodes)).to.have.length(1)

        const [root] = Object.values(nodes)
        cy.getByTestId(`open-node-${root.id}`).click()
        cy.contains(node.textContent).should("exist")
      })
  })

  /**
   * A "leaf" node is a node with exactly 1 link connected to it.
   */
  it("should be able to delete a leaf node", () => {
    cy.setup("@twoNodes")

    cy.store()
      .its("state.nodes")
      .then(nodes => {
        const leaf = Object.values(nodes)[1]
        cy.openModal("edit", leaf.id)
        cy.deleteNode()

        cy.getNodeById(leaf.id).should("not.exist")
        cy.store()
          .its("state.nodes")
          .then(nodes => {
            expect(Object.keys(nodes)).to.have.length(1)
          })
      })
  })

  it("should not be able to delete a non-leaf node", () => {
    cy.setup("@twoNodes")

    cy.store()
      .its("state.nodes")
      .then(nodes => {
        const [root, child] = Object.values(nodes)

        cy.addNode(root.id, {
          title: "child 2",
          typeData: {
            textContent: "abcd",
          },
        })

        cy.getNodeByTitle("child 2").then(({ id }) => {
          cy.addLink(id, child.id)

          cy.openModal("edit", id)
          cy.contains(/delete node/i).should("be.disabled")
        })
      })
  })

  describe("Non-empty", () => {
    beforeEach(() => {
      cy.setup("@oneNode")
    })

    it("should be able to add a child node using the node modal", () => {
      cy.getSelectedNode().then(parent => {
        const child = {
          title: "Child 1",
          description: "I am a child 1",
          mediaType: "text",
          typeData: {
            textContent: "Abcd",
          },
        }

        cy.openModal("add", parent.id)
        cy.getByTestId(`node-title`).type(child.title)
        cy.contains(/add description/i).click()
        cy.getEditable(`node-description`).type(child.description)

        cy.changeMediaType(child.mediaType)
        cy.getEditable(`node-text-content`).type(child.typeData.textContent)

        cy.submitModal()
        cy.contains(child.title).should("exist")
      })
    })

    it("should be able to edit a node's title using the node modal", () => {
      cy.getSelectedNode().then(node => {
        const oldTitle = node.title
        cy.contains(oldTitle).should("exist")

        cy.openModal("edit", node.id)
        cy.getByTestId(`node-title`)
          .clear()
          .type("new title")
        cy.submitModal()

        cy.getNodeById(node.id).within(() => {
          cy.contains(oldTitle).should("not.exist")
          cy.contains("new title").should("exist")
        })
      })
    })
  })
})

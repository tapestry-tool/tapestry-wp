describe("Node Authoring", () => {
  beforeEach(() => {
    cy.fixture("root.json").as("oneNode")
    cy.fixture("two-nodes.json").as("twoNodes")
  })

  it(`
    Given: An empty Tapestry
    When: A user adds a node using the node modal
    Then: The root node should be added
  `, () => {
    cy.setup()

    const node = {
      title: "Root",
      description: "I am a root node",
      mediaType: "text",
      textContent: "Abcd",
    }

    cy.getByTestId(`root-node-button`).click()
    cy.getByTestId(`node-title`).type(node.title)
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

  it(`
    Given: A node with one attached link
    When: A user tries to delete the node using the node modal
    Then: The node should be deleted
  `, () => {
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

  it(`
    Given: A node with several attached links
    When: A user tries to delete the node
    Then: The delete button should be disabled and a warning shown
  `, () => {
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

    it(`
      Given: A Tapestry with one node
      When: A user adds a child node with the modal
      Then: The child node should be added with no errors
    `, () => {
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
        cy.getEditable(`node-description`).type(child.description)

        cy.changeMediaType(child.mediaType)
        cy.getEditable(`node-text-content`).type(child.typeData.textContent)

        cy.submitModal()
        cy.contains(child.title).should("exist")
      })
    })

    it(`
      Given: A Tapestry node
      When: Its title is changed using the modal
      Then: It should show its new title
    `, () => {
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

import { setup } from "../support/utils"

describe("Node Authoring", () => {
  beforeEach(() => {
    cy.fixture("root.json").as("oneNode")
    cy.fixture("two-nodes.json").as("twoNodes")
  })

  it.only(`
    Given: An empty Tapestry
    When: A user adds a node using the node modal
    Then: The root node should be added
  `, () => {
    setup()

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
    When: A user tries to delete the node
    Then: The node should be deleted
  `, () => {
    setup("@twoNodes")

    cy.get("@twoNodes").then(tapestry => {
      const leaf = tapestry.nodes[1]
      cy.getNodeByTitle(leaf.title).deleteNode()
      cy.getNodeByTitle(leaf.title).should("be.null")
    })
  })

  it(`
    Given: A node with several attached links
    When: A user tries to delete the node
    Then: The delete button should be disabled and a warning shown
  `)

  describe("Non-empty", () => {
    beforeEach(() => {
      setup("@oneNode")
    })

    it(`
      Given: A Tapestry with one node
      When: A user adds two child nodes
      Then: The child nodes should be added
    `, () => {
      cy.get("@oneNode").then(tapestry => {
        const rootNode = tapestry.nodes[0]
        const nodes = [
          {
            title: "Child 1",
            description: "I am a child 1",
            mediaType: "text",
            typeData: {
              textContent: "Abcd",
            },
          },
          {
            title: "Child 2",
            description: "I am a child 2",
            mediaType: "text",
            typeData: {
              textContent: "Abcd",
            },
          },
        ]

        for (const node of nodes) {
          cy.getNodeByTitle(rootNode.title).addNode(node)
          cy.contains(node.title).should("exist")
          cy.get("#node-modal").should("not.exist")
        }
      })
    })

    it(`
      Given: A Tapestry node
      When: Its title is changed
      Then: It should show its new title
    `, () => {
      cy.getSelectedNode().then(node => {
        const oldTitle = node.title
        cy.contains(oldTitle).should("exist")

        cy.getNodeByTitle(oldTitle).editNode({
          title: "new title",
        })

        cy.contains(oldTitle).should("not.exist")
        cy.contains("new title").should("exist")
      })
    })

    it(`
      Given: A Tapestry node
      When: It's changed to a text node and opened
      Then: It should show the corresponding text
    `, () => {
      const newNode = {
        mediaType: "text",
        typeData: {
          textContent: "Hello world!",
        },
      }
      cy.getSelectedNode()
        .editNode(newNode)
        .openLightbox()
        .contains(newNode.typeData.textContent)
        .should("exist")
    })

    it(`
      Given: A Tapestry node
      When: It's changed to a video node and opened
      Then: It should show the corresponding video
    `, () => {
      const newNode = {
        mediaType: "video",
        typeData: {
          url:
            "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        },
      }
      cy.getSelectedNode()
        .editNode(newNode)
        .openLightbox()
        .within(() => {
          cy.get("video").should("have.attr", "src", newNode.typeData.url)
        })
    })
  })
})

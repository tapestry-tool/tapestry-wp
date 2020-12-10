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

    cy.contains(node.title).should("be.visible")
    cy.store()
      .its("state.nodes")
      .should(nodes => {
        expect(Object.keys(nodes)).to.have.length(1)
      })

    cy.store()
      .its("state.nodes")
      .then(nodes => {
        cy.openLightbox(Object.keys(nodes)[0])
      })
    cy.contains(node.textContent).should("exist")
  })

  it("should not show error when adding node with long description", () => {
    cy.setup()

    const node = {
      title: "Root",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      mediaType: "text",
      textContent: "dummy content",
    }

    cy.getByTestId(`root-node-button`).click()
    cy.contains(/add description/i).click()
    cy.getEditable(`node-description`).type(node.description)
    cy.getByTestId(`submit-node-modal`).click()

    cy.contains("Please limit your description").should("not.exist")
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

    const videoErrorMsg = "Invalid mp4 Video URL: please re-upload or check the URL"
    const nexistVideoURL = "www.example.com/video.mp4"

    it("Should show an error and not create a node if an mp4 URL is invalid", () => {
      cy.getSelectedNode().then(parent => {
        const nodeName = "Video 1"

        cy.openModal("add", parent.id)
        cy.getByTestId(`node-title`).type(nodeName)

        cy.changeMediaType("video")
        cy.getByTestId(`node-video-url`).type(nexistVideoURL)

        cy.getByTestId("submit-node-modal").click()
        cy.contains(videoErrorMsg, { timeout: 10000 }).should("exist")

        // check that error persists
        cy.getByTestId("submit-node-modal").click()
        cy.contains(videoErrorMsg).should("exist")

        // check that node is not created
        cy.contains(/cancel/i).click()
        cy.contains(`/${nodeName}/i`).should("not.exist")

        // check that error does not persist to new creation
        cy.openModal("add", parent.id)
        cy.changeMediaType("video")
        cy.getByTestId(`node-title`).type(nodeName)
        cy.getByTestId(`node-video-url`).type(
          "https://www.youtube.com/watch?v=nMhua5LJRWg"
        )
        cy.getByTestId("modal-submit-error").should("not.exist")
      })
    })

    const existVideoURL =
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"

    it("Should close modal with a good video url even after an error has occurred", () => {
      cy.getSelectedNode().then(parent => {
        const nodeName = "Video 2"

        cy.openModal("add", parent.id)
        cy.getByTestId(`node-title`).type(nodeName)

        cy.changeMediaType("video")
        cy.getByTestId(`node-video-url`).type(nexistVideoURL)

        cy.getByTestId("submit-node-modal").click()
        cy.contains(videoErrorMsg, { timeout: 10000 }).should("exist")

        cy.getByTestId(`node-video-url`)
          .clear()
          .type(existVideoURL)
        cy.submitModal()
      })
    })
  })
})

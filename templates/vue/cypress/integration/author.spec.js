import {
  API_URL,
  getStore,
  visitTapestry,
  getByTestId,
  openRootNodeModal,
  getModal,
  submitModal,
  openAddNodeModal,
  openEditNodeModal,
  getNode,
  getMediaButton,
  getEditNodeButton,
  getAddNodeButton,
} from "../support/utils"

const TEST_TAPESTRY_NAME = Cypress.env("TEST_TAPESTRY_NAME")

describe("Author side", () => {
  before(() => {
    cy.login("admin")
    cy.contains("Tapestries").click()
    cy.get(".page-title-action").click()

    cy.wait(150)
    cy.get("#post-title-0").type(TEST_TAPESTRY_NAME, { force: true })

    cy.wait(150)
    cy.contains("Publish…").click()
    cy.get(".editor-post-publish-panel__header-publish-button button").click()

    // wait until wordpress publishes the tapestry
    cy.contains("is now live")
    cy.logout()
  })

  after(() => {
    cy.login("admin")
    cy.contains("Tapestries").click()
    cy.get("td")
      .contains(TEST_TAPESTRY_NAME)
      .click()
    cy.contains(/move to trash/i).click()
  })

  beforeEach(() => {
    cy.login("admin")
    visitTapestry(TEST_TAPESTRY_NAME)
  })

  describe("General", function() {
    it("Should be able to add a root node", () => {
      const node = {
        title: "Root",
        description: "I am a root node",
        mediaType: "text",
        textContent: "Abcd",
      }

      cy.server()
      cy.route("POST", `${API_URL}/tapestries/**/nodes`).as("postNode")

      openRootNodeModal()
      getModal().should("exist")

      getByTestId("node-title").type(node.title)
      getByTestId("node-description").type(node.description)
      getByTestId("node-mediaType").select(node.mediaType)
      getByTestId("node-textContent").type(node.textContent)

      submitModal()
      cy.wait("@postNode")
        .its("response.body.id")
        .then(id => {
          getModal().should("not.exist")
          getNode(id).should("exist")
          cy.contains(node.title).should("exist")
        })
    })

    it("Should be able to add child nodes", () => {
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

      getStore()
        .its("state.nodes.0.id")
        .then(rootId => {
          cy.server()
          nodes.forEach(node => {
            cy.route("POST", `${API_URL}/tapestries/**/nodes`).as("postNode")

            openAddNodeModal(rootId)
            getByTestId("node-title").type(node.title)
            getByTestId("node-description").type(node.description)
            getByTestId("node-mediaType").select(node.mediaType)
            getByTestId("node-textContent").type(node.textContent)
            submitModal()

            cy.wait("@postNode")
              .its("response.body.id")
              .then(id => {
                getNode(id).should("exist")
                cy.contains(node.title).should("exist")
              })
          })
        })
    })

    it("Should be able to delete child nodes", () => {
      getStore()
        .its("state.nodes")
        .should("have.length", 3)

      getStore()
        .its("state.nodes.1.id")
        .then(id => {
          openEditNodeModal(id)
          cy.contains(/delete node/i).click()
          getNode(id).should("not.exist")
          getStore()
            .its("state.nodes")
            .should("have.length", 2)
        })
    })
  })

  describe("Node content", () => {
    it("Should be able to edit content fields and see the changes applied", () => {
      const newTitle = "New root!"
      getStore()
        .its("state.nodes.0")
        .then(root => {
          const oldTitle = root.title

          openEditNodeModal(root.id)
          getByTestId("node-title")
            .clear()
            .type(newTitle)
          submitModal()

          cy.contains(oldTitle).should("not.exist")
          cy.contains(newTitle).should("exist")
        })
    })
  })

  describe("Node appearance", () => {
    beforeEach(() => {
      getStore()
        .its("state.nodes.0.id")
        .then(id => {
          openEditNodeModal(id)
          cy.contains(/appearance/i).click()
        })
    })

    // uncheck hidden options when done
    after(() => {
      visitTapestry(TEST_TAPESTRY_NAME)
      getStore()
        .its("state.nodes.0.id")
        .then(id => {
          openEditNodeModal(id)
          cy.contains(/appearance/i).click()
        })
      const ids = ["hide-title", "hide-progress", "hide-media"]
      ids.forEach(id => {
        getByTestId(`node-appearance-${id}`).uncheck({ force: true })
      })
    })

    it("Should show a thumbnail if a thumbnail url is passed", () => {
      const url =
        "https://image.shutterstock.com/z/stock-photo-colorful-flower-on-dark-tropical-foliage-nature-background-721703848.jpg"

      getByTestId("node-appearance-add-thumbnail").check({ force: true })
      getByTestId("node-imageUrl")
        .clear()
        .type(url)
      submitModal()

      getStore()
        .its("state.nodes.0.id")
        .then(id => {
          getNode(id)
            .get("image")
            .should("have.attr", "href")
            .should("equal", url)
        })
    })

    describe("Appearance options", () => {
      const setup = prop => {
        getByTestId(`node-appearance-${prop}`).check({ force: true })
        submitModal()
      }

      it("Should hide node title", () => {
        setup("hide-title")
        getStore()
          .its("state.nodes.0.id")
          .then(id =>
            getNode(id).within(() => {
              cy.get(".meta").should("not.exist")
            })
          )
      })

      it("Should hide progress bar", () => {
        setup("hide-progress")
        getStore()
          .its("state.nodes.0.id")
          .then(id =>
            getNode(id).within(() => {
              cy.get("path").should("not.exist")
            })
          )
      })

      it("Should hide media button", () => {
        setup("hide-media")
        getStore()
          .its("state.nodes.0.id")
          .then(id => getMediaButton(id).should("be.hidden"))
      })
    })
  })

  describe("Node permissions", () => {
    it("Should hide node and associated links if user does not have read access", () => {
      getStore()
        .its("state.nodes.1.id")
        .then(id => {
          openEditNodeModal(id)
          cy.contains(/permissions/i).click()
          getByTestId("node-permissions-public-read").uncheck({ force: true })
          submitModal()

          cy.logout()
          visitTapestry(TEST_TAPESTRY_NAME)

          getNode(id).should("not.exist")
        })
    })

    it("Should hide edit button if user does not have write access", () => {
      getStore()
        .its("state.nodes.1.id")
        .then(id => {
          openEditNodeModal(id)
          cy.contains(/permissions/i).click()
          getByTestId("node-permissions-public-read").check({ force: true })
          getByTestId("node-permissions-authenticated-edit").check({ force: true })
          submitModal()

          cy.logout()
          visitTapestry(TEST_TAPESTRY_NAME)
          getNode(id).click()
          getEditNodeButton(id).should("not.exist")

          cy.login("subscriber")
          visitTapestry(TEST_TAPESTRY_NAME)
          getNode(id).click()
          getEditNodeButton(id).should("exist")
        })
    })

    it("Should hide add button if user does not have add access", () => {
      getStore()
        .its("state.nodes.1.id")
        .then(id => {
          openEditNodeModal(id)
          cy.contains(/permissions/i).click()
          getByTestId("node-permissions-authenticated-add").check({ force: true })
          submitModal()

          cy.logout()
          visitTapestry(TEST_TAPESTRY_NAME)
          getNode(id).click()
          getAddNodeButton(id).should("not.exist")

          cy.login("subscriber")
          visitTapestry(TEST_TAPESTRY_NAME)
          getNode(id).click()
          getAddNodeButton(id).should("exist")

          cy.logout()
        })
    })
  })
})

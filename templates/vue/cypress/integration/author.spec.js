import {
  API_URL,
  getStore,
  visitTapestry,
  fillNodeForm,
  generateLink,
  getByTestId,
  openRootNodeModal,
  getModal,
  submitModal,
  SITE_URL,
  addNode,
  openAddNodeModal,
  openEditNodeModal,
} from "../support/utils"

const TEST_TAPESTRY_NAME = "testing"

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
    cy.visit(`${SITE_URL}/wp-admin/`)
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

  describe.only("General", function() {
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
          cy.get(`#node-${id}`).should("exist")
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
                cy.get(`#node-${id}`).should("exist")
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
          cy.get(`#node-${id}`).should("not.exist")
          getStore()
            .its("state.nodes")
            .should("have.length", 2)
        })
    })
  })

  describe("Node content", () => {
    it("Should be able to edit content fields and see the changes applied", () => {
      cy.server()
      cy.route("GET", `${API_URL}/tapestries/*`, "@singleTapestry")
      visitTapestry()

      const newText = "New edit!"

      cy.get("#mediaButtonIcon1").click()
      getStore()
        .its("state.nodes.0")
        .then(root => {
          cy.contains(root.typeData.textContent).should("exist")
          cy.get("#lightbox .close-btn").click()

          const copy = { ...root }
          copy.typeData = { textContent: newText }
          cy.route("PUT", `${API_URL}/tapestries/**/nodes/${copy.id}`, copy)
          cy.route(
            "PUT",
            `${API_URL}/tapestries/**/nodes/${copy.id}/permissions`,
            copy
          )
        })

      cy.get("#editNodeIcon1").click()
      cy.get("#node-modal-container").should("exist")

      cy.get("#node-text-content")
        .clear()
        .type(newText)
      cy.contains("Submit").click()
      cy.get("#node-modal-container").should("not.exist")

      // should update in vuex store
      getStore()
        .its("state.nodes.0")
        .its("typeData")
        .should("include", { textContent: newText })

      // should update in lightbox
      cy.get("#mediaButtonIcon1").click()
      cy.contains(newText).should("exist")
    })
  })

  describe("Node appearance", () => {
    it("Should show a thumbnail if a thumbnail url is passed", () => {})

    describe("Appearance options", () => {
      beforeEach(() => {
        cy.server()
        cy.route("GET", `${API_URL}/tapestries/*`, "@singleTapestry")
        visitTapestry()

        cy.get("#editNodeIcon1").click()
        cy.contains("Appearance").click()
      })

      const setup = (prop, testId) => {
        cy.get("@nodeData").then(data => {
          const copy = { ...data }
          copy[prop] = true
          cy.route("PUT", `${API_URL}/tapestries/**/nodes/${copy.id}`, copy)
          cy.route(
            "PUT",
            `${API_URL}/tapestries/**/nodes/${copy.id}/permissions`,
            copy
          )
        })

        getByTestId(testId).check({ force: true })
        cy.contains("Submit").click()
      }

      it("Should hide node title", () => {
        setup("hideTitle", "hide-title")
        cy.get(".meta").should("not.exist")
      })

      it("Should hide progress bar", () => {
        setup("hideProgress", "hide-progress-bar")
        cy.get("#node-1 path").should("not.exist")
      })

      it("Should hide media button", () => {
        setup("hideMedia", "hide-media")
        cy.get("#mediaButton1").should("be.hidden")
      })
    })
  })

  describe("Node permissions", () => {
    it("Should hide node and associated links if user does not have read access", () => {
      cy.server()
      cy.route("GET", `${API_URL}/tapestries/*`, "@singleTapestry")
      visitTapestry()

      getStore()
        .its("state.nodes.0")
        .then(node => {
          const copy = { ...node }
          copy.permissions = {
            public: [],
            authenticated: [],
          }
          cy.route("PUT", `${API_URL}/tapestries/**/nodes/${copy.id}`, copy)
          cy.route(
            "PUT",
            `${API_URL}/tapestries/**/nodes/${copy.id}/permissions`,
            copy
          )
        })

      cy.get("#editNodeIcon1").click()
      cy.contains("Permissions").click()
      getByTestId("public-read").uncheck({ force: true })
      cy.contains("Submit").click()
    })

    it("Should hide edit button if user does not have write access", () => {
      cy.server()
      cy.route("GET", `${API_URL}/tapestries/*`, "@singleTapestry")
      visitTapestry()

      cy.get("#editNodeIcon1").click()
      cy.contains("Permissions").click()
    })

    it("Should hide add button if user does not have add access", () => {})
  })
})
